import { createContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { notification } from "antd";

import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import ChatPage from "@/pages/ChatPage";

import { useSocket } from "@/hooks/useSocket";
import { useConversations } from "@/hooks/useConversations";

import { connectSocket, disconnectSocket, initSocket } from "./lib/socket";

export const NotificationContext = createContext(null);

const PrivateRoute = ({ element }) => {
  const { accessToken } = useSelector((state) => state.auth);
  return !accessToken ? <Navigate to="/login" /> : element;
};

const PublicRoute = ({ element }) => {
  const { accessToken } = useSelector((state) => state.auth);
  return accessToken ? <Navigate to="/" replace /> : element;
};

function App() {
  const { accessToken } = useSelector((state) => state.auth);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    initSocket(accessToken);
    connectSocket();

    return () => disconnectSocket();
  }, [accessToken]);

  useSocket();
  useConversations();

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
        <Route path="/register" element={<PublicRoute element={<RegisterPage />} />} />

        {/* Private */}
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/" element={<PrivateRoute element={<ChatPage />} />} />
      </Routes>
    </NotificationContext.Provider>
  );
}

export default App;
