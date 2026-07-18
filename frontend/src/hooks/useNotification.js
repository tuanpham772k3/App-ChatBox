import { useContext } from "react";
import { NotificationContext } from "@/main";

export const useNotification = () => useContext(NotificationContext);
