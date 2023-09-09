import useConfig from "../../../providers/ConfigContext";
import AudioIcon from "../../icons/AudioIcon";

export default function ConfigMenuContent() {
  const { mute, volume, setMute, setVolume } = useConfig();

  return (
    <div className="flex flex-col">
      <fieldset>
        <legend>Bubble Sounds</legend>
        <div className="flex flex-row items-center gap-2 py-1">
          <label htmlFor="mute">
            <AudioIcon
              className="text-4xl"
              variant={
                mute || volume === 0
                  ? "mute"
                  : volume < 0.25
                  ? "low"
                  : volume < 0.75
                  ? "medium"
                  : "high"
              }
            />
            <input
              className="sr-only"
              id="mute"
              type="checkbox"
              checked={mute}
              onChange={(e) => setMute(e.target.checked)}
            />
          </label>
          <input
            className="accent-primary"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
          <span className="w-[5ch] text-end">{Math.round(volume * 100)}%</span>
        </div>
      </fieldset>
    </div>
  );
}
