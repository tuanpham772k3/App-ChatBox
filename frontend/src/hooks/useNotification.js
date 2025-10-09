import { useContext } from "react";
import { NotificationContext } from "../App";

export const useNotification = () => useContext(NotificationContext);
