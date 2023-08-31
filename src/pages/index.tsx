import { useMemo, useState } from "react";
import CopyIcon from "../components/icons/CopyIcon";

export default function HomePage() {
  const [twitchUsername, setTwitchUsername] = useState("");

  const link = useMemo(() => {
    return `${window.location.href}#/${twitchUsername || "rothiotome"}`;
  }, [twitchUsername]);

  const handleTwitchUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTwitchUsername(e.target.value);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-slate-700/25 rounded-2xl">
      <h1 className="text-4xl font-bold">
        Numerica by <span className="underline">RothioTome</span>
      </h1>
      <div className="relative rounded-md shadow-sm">
        <input
          type="text"
          name="twitchUsername"
          className="block w-full rounded-md border-0 py-3 px-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary text-2xl sm:leading-6"
          placeholder="Nombre de twitch..."
          value={twitchUsername}
          onChange={handleTwitchUsernameChange}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          className="flex flex-row gap-2 items-center text-xl font-bold"
          onClick={handleCopyLink}
        >
          <CopyIcon className="text-2xl" />
          <span>{link}</span>
        </button>
        <p className="text-lg">Copia este link on OBS para empezar a jugar.</p>
      </div>
    </div>
  );
}
