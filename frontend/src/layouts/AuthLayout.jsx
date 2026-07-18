import { ConfigProvider, theme } from "antd";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          fontFamily: "var(--my-font)",
        },
      }}
    >
      <Outlet />
    </ConfigProvider>
  );
};

export default AuthLayout;
