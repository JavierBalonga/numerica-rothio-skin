import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./pages/layout";
import Loading from "./pages/loading";

const HomePage = lazy(() => import("./pages"));
const GamePage = lazy(() => import("./pages/game"));
const DeprecatedGamePage = lazy(() => import("./pages/[channel]"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/game"
          element={
            <Suspense fallback={<Loading />}>
              <GamePage />
            </Suspense>
          }
        />
        <Route
          path="/:channel"
          element={
            <Suspense fallback={<Loading />}>
              <DeprecatedGamePage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
