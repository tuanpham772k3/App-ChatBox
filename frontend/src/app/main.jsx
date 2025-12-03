import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/globals.css";
import "antd/dist/reset.css";
import App from "./App.jsx";
import { persistor, store } from "./store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
