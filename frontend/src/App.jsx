import { createContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { notification } from "antd";
import { useSelector } from "react-redux";
import Login from "@/pages/Auth/LoginPage";
import Register from "@/pages/Auth/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import ChatPage from "@/pages/ChatPage";
import { useSocket } from "@/hooks/useSocket";
import { useConversations } from "@/hooks/useConversations";
import { connectSocket, disconnectSocket, initSocket } from "./lib/socket";

// import pages

export const NotificationContext = createContext(null);

const PrivateRoute = ({ element }) => {
  const { accessToken } = useSelector((state) => state.auth);
  return accessToken ? element : <Navigate to="/login" />;
};

function App() {
  const [api, contextHolder] = notification.useNotification();
  const { accessToken } = useSelector((state) => state.auth);

  // Khởi tạo và kết nối socket khi có accessToken
  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    initSocket(accessToken);
    connectSocket();

    return () => disconnectSocket();
  }, [accessToken]);

  useSocket(); // Kết nối socket và lắng nghe sự kiện global
  useConversations();

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      <Routes>
        {/* Các tuyến đường công khai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các tuyến đường bảo vệ */}
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/" element={<PrivateRoute element={<ChatPage />} />} />
      </Routes>
    </NotificationContext.Provider>
  );
}

export default App;
