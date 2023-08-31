import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <main className="grow w-full flex justify-center items-center">
      <Outlet />
    </main>
  );
}
