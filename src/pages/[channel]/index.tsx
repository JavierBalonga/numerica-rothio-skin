import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import tmi from "tmi.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const INITIAL_BUBBLE_ANIMATION_DURATION = 16000;
const INITIAL_NUMBER_CONCURRENT_BUBBLES = 4;

const FINAL_BUBBLE_ANIMATION_DURATION = 800;
const FINAL_NUMBER_CONCURRENT_BUBBLES = 42;

enum Status {
  IDLE = "IDLE",
  STARTED = "STARTED",
  GAME_OVER = "GAME_OVER",
}

interface Store {
  maxScore: number;
  maxScoreUser: string;

  status: Status;
  number: number;
  user: string;

  registerNewNumber: (newNumber: number, user: string) => void;
}

const useStore = create(
  persist<Store>(
    (set) => ({
      status: Status.IDLE,
      number: 0,
      user: "",

      maxScore: 0,
      maxScoreUser: "",

      registerNewNumber: (newNumber: number, user: string) => {
        set((prev) => {
          if (prev.user === user) return {};

          const isSuccess = newNumber === prev.number + 1;
          if (!isSuccess) {
            return {
              status: prev.number === 0 ? Status.IDLE : Status.GAME_OVER,
              number: 0,
              user: user,
            };
          }

          const isNewMaxScore = newNumber > prev.maxScore;
          if (!isNewMaxScore) {
            return {
              status: Status.STARTED,
              number: prev.number + 1,
              user: user,
            };
          }

          return {
            status: Status.STARTED,
            number: prev.number + 1,
            user: user,
            maxScore: prev.number + 1,
            maxScoreUser: user,
          };
        });
      },
    }),
    { name: "numerica", version: 1 }
  )
);

export default function GamePage() {
  const { channel } = useParams<{ channel: string }>();
  const { status, number, user, maxScore, maxScoreUser, registerNewNumber } =
    useStore();
  const [twitchClient, setTwitchClient] = useState<tmi.Client | null>(null);
  const bubbleContainer = useRef<HTMLDivElement>(null);
  const bubbleAnimation = useRef<{
    duration: number;
    numberOfBubbles: number;
  }>({
    duration: INITIAL_BUBBLE_ANIMATION_DURATION,
    numberOfBubbles: INITIAL_NUMBER_CONCURRENT_BUBBLES,
  });

  useEffect(() => {
    if (!channel) return;
    const twitchClient = new tmi.Client({ channels: [channel] });
    twitchClient.connect().catch(console.error);
    setTwitchClient(twitchClient);
    return () => {
      twitchClient.disconnect().catch(console.error);
    };
  }, [channel]);

  const handleNewMessage = useCallback(
    (
      _channel: string,
      tags: tmi.ChatUserstate,
      message: string,
      self: boolean
    ) => {
      if (self) return;

      const user = tags.displayName || tags.username;
      if (!user) return;

      const number = Number(message);
      const isFiniteNumber = isFinite(number);
      const isIntegerNumber = number % 1 === 0;
      const isPositiveNumber = number > 0;
      if (!isFiniteNumber || !isIntegerNumber || !isPositiveNumber) return;

      registerNewNumber(number, user);
    },
    [registerNewNumber]
  );

  useEffect(() => {
    if (!twitchClient) return;
    twitchClient.on("message", handleNewMessage);
    return () => {
      twitchClient.removeListener("message", handleNewMessage);
    };
  }, [twitchClient, handleNewMessage]);

  useEffect(() => {
    const factor = Math.min(number / Math.max(maxScore, 5), 1);
    bubbleAnimation.current = {
      duration: Math.round(
        factor *
          (FINAL_BUBBLE_ANIMATION_DURATION -
            INITIAL_BUBBLE_ANIMATION_DURATION) +
          INITIAL_BUBBLE_ANIMATION_DURATION
      ),
      numberOfBubbles: Math.round(
        factor *
          (FINAL_NUMBER_CONCURRENT_BUBBLES -
            INITIAL_NUMBER_CONCURRENT_BUBBLES) +
          INITIAL_NUMBER_CONCURRENT_BUBBLES
      ),
    };
  }, [number, maxScore]);

  useEffect(() => {
    let lastShot = 0;
    const updateFunction: FrameRequestCallback = (actualTime) => {
      if (!bubbleContainer.current) return;
      const { duration, numberOfBubbles } = bubbleAnimation.current;
      const timeBetweenBubbles = duration / numberOfBubbles;
      if (timeBetweenBubbles < actualTime - lastShot) {
        const bubble = document.createElement("div");
        bubble.className =
          "absolute bg-white rounded-full top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-bubble";

        const radius = 35;
        const alpha = Math.random() * Math.PI * 2;
        const targetTop = Math.sin(alpha) * radius + 50;
        const targetLeft = Math.cos(alpha) * radius + 50;

        bubble.style.setProperty("--target-top", `${targetTop}%`);
        bubble.style.setProperty("--target-left", `${targetLeft}%`);
        bubble.style.setProperty("--animation-duration", `${duration}ms`);
        bubbleContainer.current.appendChild(bubble);
        setTimeout(() => {
          bubbleContainer.current?.removeChild(bubble);
        }, duration);

        lastShot = actualTime;
      }

      requestAnimationFrame(updateFunction);
    };

    const animationRequest = requestAnimationFrame(updateFunction);

    return () => {
      cancelAnimationFrame(animationRequest);
    };
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden relative flex items-center justify-center w-[400px] h-[400px] rounded-full">
        <span className="text-8xl font-bold leading-tight text-white relative z-10">
          {number}
        </span>
        <div className="absolute inset-[-100px]">
          <div className="absolute inset-0 bg-primary"></div>
          <div
            className="absolute inset-0 bg-black blur-lg contrast-[100] flex items-center justify-center mix-blend-multiply"
            ref={bubbleContainer}
          >
            <div className="bg-white w-[200px] h-[200px] rounded-full"></div>
          </div>
        </div>
      </div>
      <p className="text-xl font-bold text-white bg-primary py-2 px-6 rounded-3xl absolute top-0 left-1/2 -translate-x-1/2">
        Max Score: {maxScore}
        {maxScoreUser && (
          <>
            <br />
            by {maxScoreUser}
          </>
        )}
      </p>
      {(status === Status.GAME_OVER || status === Status.STARTED) && (
        <p className="text-xl font-bold text-white bg-primary py-2 px-6 rounded-3xl absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">
          {status === Status.GAME_OVER ? `Blame on ${user}!` : user}
        </p>
      )}
    </div>
  );
}
