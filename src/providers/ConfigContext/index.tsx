import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConfigState {
  channel: string;
  setChannel: (channel: string) => void;
  volume: number;
  setVolume: (volume: number) => void;
  enableTimeout: boolean;
  setEnableTimeout: (enableTimeout: boolean) => void;
  timeoutMultiplier: number;
  setTimeoutMultiplier: (timeoutMultiplier: number) => void;
  timeoutBase: number;
  setTimeoutBase: (timeoutBase: number) => void;
}

const useConfig = create(
  persist<ConfigState>(
    (set) => ({
      channel: "",
      setChannel: (channel) => set({ channel }),
      volume: 0,
      setVolume: (volume) => set({ volume }),
      enableTimeout: false,
      setEnableTimeout: (enableTimeout) => set({ enableTimeout }),
      timeoutMultiplier: 10,
      setTimeoutMultiplier: (timeoutMultiplier) => set({ timeoutMultiplier }),
      timeoutBase: 0,
      setTimeoutBase: (timeoutBase) => set({ timeoutBase }),
    }),
    { name: "numerica-config", version: 2 }
  )
);

export default useConfig;
