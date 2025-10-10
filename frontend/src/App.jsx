import { createContext } from "react";
import { Routes, Route } from "react-router-dom";
import { notification } from "antd";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";

export const NotificationContext = createContext(null);

function App() {
    const [api, contextHolder] = notification.useNotification();

    return (
        <NotificationContext.Provider value={api}>
            {contextHolder}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </NotificationContext.Provider>
    );
}

export default App;
