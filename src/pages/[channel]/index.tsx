import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useConfig from "../../providers/ConfigContext";

export default function DeprecatedGamePage() {
  const { channel } = useParams<{ channel: string }>();
  const navigate = useNavigate();
  const { setChannel } = useConfig();

  useEffect(() => {
    if (!channel) return;
    setChannel(channel);
    navigate("/game");
  }, [channel, setChannel]);

  return <></>;
}
