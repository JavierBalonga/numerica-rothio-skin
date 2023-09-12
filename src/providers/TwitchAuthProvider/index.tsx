import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import randomString from "../../utils/randomString";
import useTwitchAuthStore, { TwitchAuthStore } from "./useTwitchAuthStore";

export interface TwitchAuthContext
  extends Pick<TwitchAuthStore, "accessToken"> {
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  goToLogin: () => void;
  logOut: () => void;
}

const Context = createContext<TwitchAuthContext | null>(null);

export interface TwitchAuthProviderProps {
  children: ReactNode;
  clientId: string;
  scopes?: string[];
}

export const TwitchAuthProvider = ({
  children,
  clientId,
  scopes = [],
}: TwitchAuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const {
    state,
    redirectUrl,
    setPendingAuthState,
    accessToken,
    setAccessToken,
  } = useTwitchAuthStore();

  useEffect(() => {
    if (!state || !redirectUrl || !window.location.href.startsWith(redirectUrl))
      return;

    const hashParams = new URLSearchParams(
      window.location.href.slice(redirectUrl.length + 1)
    );

    /* prettier-ignore */
    const urlState = hashParams.get("state");
    /* prettier-ignore */
    const errorCode = hashParams.get("error");
    /* prettier-ignore */
    const errorDescription = hashParams.get("error_description");
    /* prettier-ignore */
    const newAccessToken = hashParams.get("access_token");

    console.log({
      urlState,
      errorCode,
      errorDescription,
      newAccessToken,
    });

    if (urlState !== null && urlState !== state) {
      setError(new Error("State does not match"));
    } else if (errorCode !== null && errorDescription !== null) {
      setError(new Error(errorDescription || errorCode));
    } else if (newAccessToken !== null) {
      setPendingAuthState(null, null);
      setAccessToken(newAccessToken);
      window.history.replaceState({}, "", redirectUrl);
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = useMemo(() => accessToken !== null, [accessToken]);

  const goToLogin = useCallback(() => {
    const newState = randomString(64);
    const actualUrl = window.location.href;
    setPendingAuthState(actualUrl, newState);
    const loginUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    loginUrl.searchParams.append("response_type", "token");
    loginUrl.searchParams.append("client_id", clientId);
    loginUrl.searchParams.append("redirect_uri", actualUrl);
    loginUrl.searchParams.append("scope", scopes.join(" "));
    loginUrl.searchParams.append("state", newState);
    window.location.replace(loginUrl.toString());
  }, [clientId, scopes]);

  const logOut = useCallback(() => {
    setAccessToken(null);
  }, []);

  return (
    <Context.Provider
      value={{
        accessToken,
        isLoading,
        error,
        isAuthenticated,
        goToLogin,
        logOut,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useTwitchAuth = () => {
  const context = useContext(Context);
  if (context === null) {
    throw new Error(
      "useTwitchAuthProvider has to be inside a TwitchAuthProvider"
    );
  }
  return context;
};
