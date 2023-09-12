import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TwitchAuthState {
  redirectUrl: string | null;
  state: string | null;
  setPendingAuthState: (
    redirectUrl: string | null,
    state: string | null
  ) => void;

  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export interface TwitchAuthMethods {}

export type TwitchAuthStore = TwitchAuthState & TwitchAuthMethods;

const useTwitchAuthStore = create(
  persist<TwitchAuthStore>(
    (set) => ({
      redirectUrl: null,
      state: null,
      setPendingAuthState: (redirectUrl, state) => set({ redirectUrl, state }),

      accessToken: null,
      setAccessToken: (accessToken: string | null) => set({ accessToken }),
    }),
    { name: "twitch-auth", version: 1 }
  )
);

export default useTwitchAuthStore;
