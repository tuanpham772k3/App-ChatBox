import { createContext, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { notification } from "antd";

import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";

import MainLayout from "@/layouts/MainLayout";
import MessagingLayout from "@/layouts/MessagingLayout";
import CommunityLayout from "@/layouts/CommunityLayout";

import ChatEmptyState from "@/pages/ChatEmptyState";
import ChatWindow from "@/pages/ChatWindow";
import CommunityFriends from "./pages/CommunityFriends";
import CommunityGroups from "./pages/CommunityGroups";
import ProfilePage from "@/pages/ProfilePage";

import { useSocket } from "@/hooks/useSocket";

import { connectSocket, disconnectSocket, initSocket } from "./lib/socket";
import CommunityFriendInvitation from "./pages/CommunityFriendInvitation";

export const NotificationContext = createContext(null);

const PrivateRoute = () => {
  const { accessToken } = useSelector((state) => state.auth);
  return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
  const { accessToken } = useSelector((state) => state.auth);
  return accessToken ? <Navigate to="/messages" replace /> : <Outlet />;
};

function App() {
  const { accessToken } = useSelector((state) => state.auth);
  const mode = useSelector((state) => state.theme?.mode);
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

  useEffect(() => {
    if (!mode) return;
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      <Routes>
        {/* Public */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Private */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/chat" replace />} />

            <Route path="/chat" element={<MessagingLayout />}>
              <Route index element={<ChatEmptyState />} />
              <Route path=":conversationId" element={<ChatWindow />} />
            </Route>

            <Route path="/community" element={<CommunityLayout />}>
              <Route path="friends" element={<CommunityFriends />} />
              <Route path="groups" element={<CommunityGroups />} />
              <Route path="friend-invitation" element={<CommunityFriendInvitation />} />
              <Route path="chat/:conversationId" element={<ChatWindow />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </NotificationContext.Provider>
  );
}

export default App;
