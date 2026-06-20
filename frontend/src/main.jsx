import "../src/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../src/store/store";
import { ConfigProvider, theme as antdTheme } from "antd";
import App from "./App.jsx";

const AppProvider = ({ children }) => {
  const mode = useSelector((state) => state.theme.mode);

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          fontFamily: "var(--my-font)",
        },
      }}
    >
      {children}
    </ConfigProvider>
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
