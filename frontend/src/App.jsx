import { createContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { notification } from "antd";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import ProfilePage from "./pages/Profile/ProfilePage";

export const NotificationContext = createContext(null);

const PrivateRoute = ({ element }) => {
  const isAuthenticated = () => {
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    return accessToken && user;
  };

  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function App() {
  const [api, contextHolder] = notification.useNotification();

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      <Routes>
        {/* Các tuyến đường công khai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các tuyến đường bảo vệ */}
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
      </Routes>
    </NotificationContext.Provider>
  );
}

export default App;
