import useConfig from "../../../providers/ConfigContext";
import { useTwitchAuth } from "../../../providers/TwitchAuthProvider";
import AudioIcon from "../../icons/AudioIcon";

export default function ConfigMenuContent() {
  const {
    channel,
    setChannel,
    volume,
    setVolume,
    enableTimeout,
    setEnableTimeout,
    timeoutMultiplier,
    setTimeoutMultiplier,
    timeoutBase,
    setTimeoutBase,
  } = useConfig();
  const { isAuthenticated, goToLogin, logOut } = useTwitchAuth();

  return (
    <div className="flex flex-col gap-2">
      <fieldset>
        <legend>Channel</legend>
        <input
          type="text"
          name="channel"
          className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary text-2xl sm:leading-6"
          placeholder="Nombre de twitch..."
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
      </fieldset>
      <fieldset>
        <legend>Bubble Sounds</legend>
        <div className="flex flex-row items-center gap-2 py-1">
          <AudioIcon
            className="text-4xl"
            variant={
              volume === 0
                ? "mute"
                : volume < 0.25
                ? "low"
                : volume < 0.75
                ? "medium"
                : "high"
            }
          />
          <input
            className="accent-primary w-full"
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
      {!isAuthenticated ? (
        <button
          className="w-full py-2 px-4 bg-primary text-white rounded-2xl"
          onClick={goToLogin}
        >
          Login With Twitch
        </button>
      ) : (
        <>
          {/* TODO change to a switch */}
          <fieldset>
            <legend>Enable Timeout</legend>
            <input
              className="accent-primary"
              id="enable-timeout"
              type="checkbox"
              checked={enableTimeout}
              onChange={(e) => setEnableTimeout(e.target.checked)}
            />
          </fieldset>
          {enableTimeout && (
            <>
              <fieldset>
                <legend>Timeout Multiplier</legend>
                <input
                  type="number"
                  name="timeout-multiplier"
                  className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary text-2xl sm:leading-6"
                  placeholder="Timeout Multiplier"
                  value={timeoutMultiplier}
                  onChange={(e) => {
                    const number = Number(e.target.value);
                    const isFinite = Number.isFinite(number);
                    const isNotNegative = number >= 0;
                    const isInteger = Number.isInteger(number);
                    if (isFinite && isNotNegative && isInteger) {
                      setTimeoutMultiplier(number);
                    }
                  }}
                />
              </fieldset>
              <fieldset>
                <legend>Timeout Base</legend>
                <input
                  type="number"
                  name="timeout-base"
                  className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary text-2xl sm:leading-6"
                  placeholder="Timeout Base"
                  value={timeoutBase}
                  onChange={(e) => {
                    const number = Number(e.target.value);
                    const isFinite = Number.isFinite(number);
                    const isNotNegative = number >= 0;
                    const isInteger = Number.isInteger(number);
                    if (isFinite && isNotNegative && isInteger) {
                      setTimeoutBase(number);
                    }
                  }}
                />
              </fieldset>
            </>
          )}

          <button
            className="w-full py-2 px-4 bg-primary text-white rounded-2xl"
            onClick={logOut}
          >
            LogOut
          </button>
        </>
      )}
    </div>
  );
}
