import { store } from "@/store/store";
import { setAccessToken, clearState } from "@/store/authSlice";
import axios from "axios";

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "http://localhost:8383/api",
  timeout: 5000,
  withCredentials: true,
});

let refreshPromise = null;

export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await refreshClient.post("/auth/refresh-token");

      const accessToken = res.data.data;

      store.dispatch(setAccessToken(accessToken));

      return accessToken;
    } catch (err) {
      store.dispatch(clearState());
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
