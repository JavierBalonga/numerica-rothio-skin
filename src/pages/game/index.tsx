import { useEffect, useState, useCallback, useRef } from "react";
import tmi from "tmi.js";
import clamp from "../../utils/clamp";
import lerp from "../../utils/lerp";
import { twMerge } from "tailwind-merge";
import ConfigMenu from "../../components/ConfigMenu";
import useGameState, { GameStatus } from "../../providers/GameContext";
import useConfig from "../../providers/ConfigContext";
import useTimeoutUser from "./useTimeoutUser";
import useGetUser from "./useGetUser";
import { useTwitchAuth } from "../../providers/TwitchAuthProvider";

const INITIAL_BUBBLE_ANIMATION_DURATION = 10000;
const INITIAL_NUMBER_CONCURRENT_BUBBLES = 4;

const FINAL_BUBBLE_ANIMATION_DURATION = 1000;
const FINAL_NUMBER_CONCURRENT_BUBBLES = 40;

const bubbleAudios = Array.from(
  { length: 8 },
  (_, i) => new Audio(`/bubble-${i}.mp3`)
);

export default function GamePage() {
  const { isAuthenticated } = useTwitchAuth();
  const channel = useConfig((config) => config.channel);
  const volume = useConfig((config) => config.volume);
  const enableTimeout = useConfig((config) => config.enableTimeout);
  const timeoutBase = useConfig((config) => config.timeoutBase);
  const timeoutMultiplier = useConfig((config) => config.timeoutMultiplier);
  const { status, number, user, maxScore, maxScoreUser, setGameState } =
    useGameState();
  const [twitchClient, setTwitchClient] = useState<tmi.Client | null>(null);
  const [timeoutUser] = useTimeoutUser();
  const [getUser, { data: channelUser }] = useGetUser();
  const bubbleContainer = useRef<HTMLDivElement>(null);
  const bubbleAnimation = useRef<{
    duration: number;
    numberOfBubbles: number;
    volume: number;
  }>({
    duration: INITIAL_BUBBLE_ANIMATION_DURATION,
    numberOfBubbles: INITIAL_NUMBER_CONCURRENT_BUBBLES,
    volume: volume,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    getUser({ username: channel });
  }, []);

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
    setGameState(() => ({ maxScore: number, maxScoreUser: maxScoreUserParam }));
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

      const userId = tags["user-id"];
      const newUser = tags.displayName || tags.username;
      const isMod = Boolean(tags.mod);
      if (!userId || !newUser) return;

      const newNumber = Number(message);
      const isFiniteNumber = isFinite(newNumber);
      const isIntegerNumber = newNumber % 1 === 0;
      const isPositiveNumber = newNumber > 0;
      if (!isFiniteNumber || !isIntegerNumber || !isPositiveNumber) return;

      setGameState((prev) => {
        if (prev.status === GameStatus.STARTED && prev.user === newUser)
          return {};

        const isSuccess = newNumber === prev.number + 1;
        if (!isSuccess) {
          if (
            isAuthenticated &&
            enableTimeout &&
            (timeoutMultiplier || timeoutBase) &&
            channelUser &&
            !isMod &&
            prev.number > 0
          ) {
            timeoutUser({
              broadcasterId: channelUser.id,
              moderatorId: channelUser.id,
              userId: userId,
              duration: timeoutBase + prev.number * timeoutMultiplier,
            });
          }
          return {
            status: prev.number === 0 ? GameStatus.IDLE : GameStatus.GAME_OVER,
            number: 0,
            user: newUser,
          };
        }

        const isNewMaxScore = newNumber > prev.maxScore;
        if (!isNewMaxScore) {
          return {
            status: GameStatus.STARTED,
            number: prev.number + 1,
            user: newUser,
          };
        }

        return {
          status: GameStatus.STARTED,
          number: prev.number + 1,
          user: newUser,
          maxScore: prev.number + 1,
          maxScoreUser: newUser,
        };
      });
    },
    [
      setGameState,
      timeoutUser,
      isAuthenticated,
      enableTimeout,
      timeoutMultiplier,
      timeoutBase,
      channelUser,
    ]
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
      volume: volume,
    };
  }, [number, maxScore, volume]);

  useEffect(() => {
    let animationRequest: number | null = null;

    let lastShot = 0;
    const updateFunction: FrameRequestCallback = (actualTime) => {
      if (!bubbleContainer.current) return;
      const { duration, numberOfBubbles } = bubbleAnimation.current;
      const timeBetweenBubbles = duration / numberOfBubbles;
      if (timeBetweenBubbles < actualTime - lastShot) {
        const radius = 25;
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
          const { volume } = bubbleAnimation.current;
          if (volume > 0) {
            const bubbleAudio =
              bubbleAudios[Math.floor(Math.random() * bubbleAudios.length)];
            bubbleAudio.volume = volume;
            bubbleAudio.play();
          }
        }, Math.floor(duration * 0.67));

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
    <div className="relative group">
      <div className="relative flex items-center justify-center w-[400px] h-[400px] rounded-full">
        {[number - 1, number].map((num) =>
          num < 0 ? null : (
            <div
              key={num}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[200px] h-[200px] flex justify-center items-center bg-black p-4 rounded-full overflow-hidden mix-blend-screen contrast-[100]"
            >
              <span
                className={twMerge(
                  "text-8xl font-bold leading-tight text-white blur-[1px]",
                  num === number
                    ? "animate-bubble-fade-in"
                    : "animate-bubble-fade-out opacity-0"
                )}
              >
                {num}
              </span>
            </div>
          )
        )}

        <div className="absolute -inset-[50%]">
          <div className="absolute inset-0 bg-primary-circle"></div>
          <div
            className="absolute inset-0 bg-black blur-lg contrast-[100] flex items-center justify-center mix-blend-multiply"
            ref={bubbleContainer}
          >
            <div className="bg-white w-[200px] h-[200px] rounded-full"></div>
          </div>
        </div>
      </div>
      <p className="text-xl font-bold text-white bg-primary py-2 px-6 rounded-3xl absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
        Max Score: {maxScore}
        {maxScoreUser && (
          <>
            <br />
            by {maxScoreUser}
          </>
        )}
      </p>
      {(status === GameStatus.GAME_OVER || status === GameStatus.STARTED) && (
        <p className="text-xl font-bold text-white bg-primary py-2 px-6 rounded-3xl absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
          {status === GameStatus.GAME_OVER ? `Blame on ${user}!` : user}
        </p>
      )}

      <ConfigMenu />
    </div>
  );
}
