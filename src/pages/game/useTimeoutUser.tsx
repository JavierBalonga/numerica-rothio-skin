import { useCallback, useState } from "react";
import useTwitchAuthStore from "../../providers/TwitchAuthProvider/useTwitchAuthStore";

const { VITE_TWITCH_CLIENT_ID } = import.meta.env;

export interface TimeoutUserOptions {
  broadcasterId: string;
  moderatorId: string;
  userId: string;
  duration: number;
}

const useTimeoutUser = () => {
  const { accessToken } = useTwitchAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const timeoutUser = useCallback(
    async ({
      broadcasterId,
      moderatorId,
      userId,
      duration,
    }: TimeoutUserOptions) => {
      setLoading(true);
      setError(null);
      try {
        console.log({
          broadcasterId,
          moderatorId,
          userId,
          duration,
        });

        const url = new URL("https://api.twitch.tv/helix/moderation/bans");
        url.searchParams.append("broadcaster_id", broadcasterId);
        url.searchParams.append("moderator_id", moderatorId);
        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Id": VITE_TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            data: {
              user_id: userId,
              duration: duration < 1 ? 1 : duration,
              reason: "Numerica Rothio Skin - Timeout",
            },
          }),
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return await response.json();
      } catch (error) {
        // TODO handle token expired error
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return [timeoutUser, { loading, error }] as const;
};

export default useTimeoutUser;
