import { useContext } from "react";
import { NotificationContext } from "@/app/App";

export const useNotification = () => useContext(NotificationContext);
