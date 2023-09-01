import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import tmi from "tmi.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import clamp from "../../utils/clamp";
import lerp from "../../utils/lerp";

const INITIAL_BUBBLE_ANIMATION_DURATION = 10000;
const INITIAL_NUMBER_CONCURRENT_BUBBLES = 4;

const FINAL_BUBBLE_ANIMATION_DURATION = 1000;
const FINAL_NUMBER_CONCURRENT_BUBBLES = 40;

enum Status {
  IDLE = "IDLE",
  STARTED = "STARTED",
  GAME_OVER = "GAME_OVER",
}

interface Store {
  status: Status;
  number: number;
  user: string;
  maxScore: number;
  maxScoreUser: string;

  registerNewNumber: (newNumber: number, newUser: string) => void;
  setMaxScore: (number: number, user: string) => void;
}

const useStore = create(
  persist<Store>(
    (set) => ({
      status: Status.IDLE,
      number: 0,
      user: "",
      maxScore: 0,
      maxScoreUser: "",

      registerNewNumber: (newNumber, newUser) => {
        set((prev) => {
          // if (prev.user === newUser) return {};

          const isSuccess = newNumber === prev.number + 1;
          if (!isSuccess) {
            return {
              status: prev.number === 0 ? Status.IDLE : Status.GAME_OVER,
              number: 0,
              user: newUser,
            };
          }

          const isNewMaxScore = newNumber > prev.maxScore;
          if (!isNewMaxScore) {
            return {
              status: Status.STARTED,
              number: prev.number + 1,
              user: newUser,
            };
          }

          return {
            status: Status.STARTED,
            number: prev.number + 1,
            user: newUser,
            maxScore: prev.number + 1,
            maxScoreUser: newUser,
          };
        });
      },

      setMaxScore: (maxScore: number, maxScoreUser: string) => {
        set(() => ({
          maxScore: maxScore,
          maxScoreUser: maxScoreUser,
        }));
      },
    }),
    { name: "numerica", version: 1 }
  )
);

export default function GamePage() {
  const { channel } = useParams<{ channel: string }>();
  const {
    status,
    number,
    user,
    maxScore,
    maxScoreUser,
    registerNewNumber,
    setMaxScore,
  } = useStore();
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
    const actualUrl = new URL(window.location.href);
    const hashParams = new URLSearchParams(actualUrl.hash.substr(1));
    const maxScoreParam = hashParams.get("maxScore");
    const maxScoreUserParam = hashParams.get("maxScoreUser");
    const number = Number(maxScoreParam);
    const isFiniteNumber = isFinite(number);
    const isIntegerNumber = number % 1 === 0;
    const isPositiveNumber = number > 0;
    if (
      !maxScoreParam ||
      !maxScoreUserParam ||
      !isFiniteNumber ||
      !isIntegerNumber ||
      !isPositiveNumber ||
      number < maxScore
    )
      return;
    setMaxScore(number, maxScoreUserParam);
  }, []);

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
    const factor = clamp(0, number, 50) / clamp(5, maxScore, 50);
    bubbleAnimation.current = {
      duration: Math.round(
        lerp(
          INITIAL_BUBBLE_ANIMATION_DURATION,
          FINAL_BUBBLE_ANIMATION_DURATION,
          factor
        )
      ),
      numberOfBubbles: Math.round(
        lerp(
          INITIAL_NUMBER_CONCURRENT_BUBBLES,
          FINAL_NUMBER_CONCURRENT_BUBBLES,
          factor
        )
      ),
    };
  }, [number, maxScore]);

  useEffect(() => {
    let animationRequest: number | null = null;

    let lastShot = 0;
    const updateFunction: FrameRequestCallback = (actualTime) => {
      if (!bubbleContainer.current) return;
      const { duration, numberOfBubbles } = bubbleAnimation.current;
      const timeBetweenBubbles = duration / numberOfBubbles;
      if (timeBetweenBubbles < actualTime - lastShot) {
        const radius = 35;
        const alpha = Math.random() * Math.PI * 2;
        const targetTop = Math.sin(alpha) * radius + 50;
        const targetLeft = Math.cos(alpha) * radius + 50;

        const bubble = document.createElement("div");
        bubble.classList.add("absolute");
        bubble.classList.add("bg-white");
        bubble.classList.add("rounded-full");
        bubble.classList.add("top-1/2");
        bubble.classList.add("left-1/2");
        bubble.classList.add("-translate-y-1/2");
        bubble.classList.add("-translate-x-1/2");
        bubble.classList.add("animate-bubble");
        bubble.style.setProperty("--target-top", `${targetTop}%`);
        bubble.style.setProperty("--target-left", `${targetLeft}%`);
        bubble.style.setProperty("--animation-duration", `${duration}ms`);
        bubbleContainer.current.appendChild(bubble);

        setTimeout(() => {
          bubbleContainer.current?.removeChild(bubble);
        }, duration);

        lastShot = actualTime;
      }

      animationRequest = requestAnimationFrame(updateFunction);
    };

    animationRequest = requestAnimationFrame(updateFunction);

    return () => {
      if (animationRequest) {
        cancelAnimationFrame(animationRequest);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden relative flex items-center justify-center w-[400px] h-[400px] rounded-full ">
        <span className="text-8xl font-bold leading-tight text-white relative z-10">
          {number}
        </span>
        <div className="absolute -inset-[100px]">
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
