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

  registerNewNumber: (newNumber: number, newUser: string) => void;
  setMaxScore: (number: number, user: string) => void;
}

const useGameState = create(
  persist<GameState>(
    (set) => ({
      status: GameStatus.IDLE,
      number: 0,
      user: "",
      maxScore: 0,
      maxScoreUser: "",

      registerNewNumber: (newNumber, newUser) => {
        set((prev) => {
          if (prev.user === newUser) return {};

          const isSuccess = newNumber === prev.number + 1;
          if (!isSuccess) {
            return {
              status:
                prev.number === 0 ? GameStatus.IDLE : GameStatus.GAME_OVER,
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

export default useGameState;
