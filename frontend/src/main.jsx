import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/globals.css";
import App from "./App.jsx";
import { persistor, store } from "../src/store/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: "var(--my-font)",
              },
            }}
          >
            <App />
          </ConfigProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
