import "../src/styles/globals.css";
import { createContext, StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../src/store/store";
import App from "./App.jsx";
import { ConfigProvider, theme as antdTheme, notification } from "antd";

export const NotificationContext = createContext(null);

const AppProvider = ({ children }) => {
  const mode = useSelector((state) => state.theme.mode);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!mode) return;
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <NotificationContext.Provider value={api}>
      <ConfigProvider
        theme={{
          algorithm:
            mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            fontFamily: "var(--my-font)",
          },
        }}
      >
        {contextHolder}
        {children}
      </ConfigProvider>
    </NotificationContext.Provider>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
