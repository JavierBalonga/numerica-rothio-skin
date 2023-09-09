import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConfigState {
  mute: boolean;
  volume: number;
  setMute: (mute: boolean) => void;
  setVolume: (volume: number) => void;
}

const useConfig = create(
  persist<ConfigState>(
    (set) => ({
      mute: true,
      volume: 1,
      setMute: (mute) => set({ mute }),
      setVolume: (volume) => set({ volume }),
    }),
    { name: "numerica-config", version: 1 }
  )
);

export default useConfig;
