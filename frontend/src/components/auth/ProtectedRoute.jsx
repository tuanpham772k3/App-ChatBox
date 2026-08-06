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
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (!isInitializing) return;

    const bootstrap = async () => {
      try {
        if (!accessToken) {
          await refreshAccessToken();
        }

        if (!currentUser) {
          await dispatch(getMe()).unwrap();
        }
      } catch (err) {
        console.log("No active session");
      } finally {
        dispatch(setInitializing(false));
      }
    };

    bootstrap();
  }, [accessToken, currentUser, dispatch, isInitializing]);

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
