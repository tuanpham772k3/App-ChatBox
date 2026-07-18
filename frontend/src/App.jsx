import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import MessagingLayout from "@/layouts/MessagingLayout";
import CommunityLayout from "@/layouts/CommunityLayout";
import AuthLayout from "./layouts/AuthLayout";

import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import ChatEmptyState from "@/pages/ChatEmptyState";
import ChatWindow from "@/pages/ChatWindow";
import CommunityFriends from "./pages/CommunityFriends";
import CommunityGroups from "./pages/CommunityGroups";
import CommunityFriendInvitation from "./pages/CommunityFriendInvitation";
import ProfilePage from "@/pages/ProfilePage";

import { useSocket } from "@/hooks/useSocket";
import { connectSocket, disconnectSocket, initSocket } from "./lib/socket";
import PublicRoute from "./components/auth/PublicRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    initSocket(accessToken);
    connectSocket();
  }, [accessToken]);

  useSocket();

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Private */}
      <Route element={<ProtectedRoute />}>
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
  );
}

export default App;
