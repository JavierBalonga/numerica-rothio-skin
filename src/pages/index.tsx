import { MouseEvent, useMemo } from "react";
import CopyIcon from "../components/icons/CopyIcon";
import colorFilterExampleImg from "../assets/color-filter-example.png";

export default function HomePage() {
  const link = useMemo(() => {
    return `${window.location.href}#/game`;
  }, []);

  const handleCopyLink = (e: MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(link);
    const element = e.currentTarget;
    element.classList.add("before:opacity-100");
    setTimeout(() => {
      element.classList.remove("before:opacity-100");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-slate-700/25 rounded-2xl">
      <h1 className="text-4xl font-bold text-white">
        Numerica <span className="underline text-primary">RothioTome</span> Skin
      </h1>
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg text-center text-slate-400">
          Para empezar a jugar, Copia la siguiente{" "}
          <strong className="text-primary">URL</strong>
          <br />y agregala como{" "}
          <strong className="text-primary">Fuente de Navegador</strong> a tu OBS
        </p>
        <button
          className="relative flex flex-row gap-2 items-center text-xl font-bold underline before:content-['Copied!'] before:absolute before:top-1/2 before:-right-5 before:translate-x-full before:-translate-y-1/2 before:transition before:duration-300 before:ease-in-out before:rounded-md before:px-2 before:py-1 before:bg-slate-700 before:text-white before:ring-primary before:ring-inset before:opacity-0"
          onClick={handleCopyLink}
        >
          <span>{link}</span>
          <CopyIcon className="text-2xl" />
        </button>
        <p className="text-lg text-center text-slate-400">
          Con <strong className="text-primary">400 x 400 (px)</strong> deberia
          andar correctamente
          <br />
          luego puedes redimensionar si gustas
          <br />Y por ultimo agregale un{" "}
          <strong className="text-primary">filtro de color</strong> de la
          siguiente manera:
        </p>
        <img src={colorFilterExampleImg} alt="Color Filter Examples" />
      </div>
    </div>
  );
}
