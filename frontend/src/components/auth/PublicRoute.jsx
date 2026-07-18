import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { accessToken } = useSelector((state) => state.auth);

  return accessToken ? <Navigate to="/chat" replace /> : <Outlet />;
};

export default PublicRoute;
