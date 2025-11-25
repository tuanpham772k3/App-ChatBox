import { useEffect } from "react";
import { useSelector } from "react-redux";
import { offEvent, onEvent } from "@/lib/socket";

export const useSocket = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    // Xử lý sự kiện global
    const onStatus = (data) => {
      console.log("User status changed:", data);
    };
    const onTyping = (data) => {
      console.log("User typing:", data);
    };

    // Lắng nghe sự kiện từ server
    onEvent("user:status", onStatus);
    onEvent("user:typing", onTyping);

    return () => {
      offEvent("user:status", onStatus);
      offEvent("user:typing", onTyping);
    };
  }, [accessToken]);
};
