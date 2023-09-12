import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum GameStatus {
  IDLE = "IDLE",
  STARTED = "STARTED",
  GAME_OVER = "GAME_OVER",
}

export interface GameState {
  status: GameStatus;
  number: number;
  user: string;
  maxScore: number;
  maxScoreUser: string;

  setGameState: (
    stateAction: (
      prevState: GameState
    ) => Partial<
      Pick<
        GameState,
        "status" | "number" | "user" | "maxScore" | "maxScoreUser"
      >
    >
  ) => void;
}

const useGameState = create(
  persist<GameState>(
    (set) => ({
      status: GameStatus.IDLE,
      number: 0,
      user: "",
      maxScore: 0,
      maxScoreUser: "",

      setGameState: (action) => {
        set(action);
      },
    }),
    { name: "numerica", version: 1 }
  )
);

export default useGameState;
