import { useCallback, useState } from "react";
import useTwitchAuthStore from "../../providers/TwitchAuthProvider/useTwitchAuthStore";

const { VITE_TWITCH_CLIENT_ID } = import.meta.env;

export interface GetUserOptions {
  username: string;
}

export interface User {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email: string;
  created_at: Date;
}

export interface GetUserResponse {
  data: User[];
}

const useGetUser = () => {
  const { accessToken } = useTwitchAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<User | null>(null);

  const getUser = useCallback(async ({ username }: GetUserOptions) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("https://api.twitch.tv/helix/users");
      url.searchParams.append("login", username);
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Client-Id": VITE_TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const getUserResponse = (await response.json()) as GetUserResponse;
      const user = getUserResponse.data[0];
      setData(user);
      return user;
    } catch (error) {
      // TODO handle token expired error
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return [getUser, { loading, error, data }] as const;
};

export default useGetUser;
