import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import AppLoadingScreen from "../ui/AppLoadingScreen";
import { setInitializing } from "@/store/authSlice";
import { getMe } from "@/store/userSlice";
import { refreshAccessToken } from "@/lib/refreshManager";

const ProtectedRoute = () => {
  const dispatch = useDispatch();

  const { accessToken, isInitializing } = useSelector((state) => state.auth);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshAccessToken();
        await dispatch(getMe()).unwrap();
      } catch (err) {
        console.log("No active session");
      } finally {
        dispatch(setInitializing(false));
      }
    };

    bootstrap();
  }, [dispatch]);

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
