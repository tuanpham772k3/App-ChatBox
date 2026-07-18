import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import loadingBg from "@/assets/images/login-bg.jpg";
import logo from "@/assets/logo.svg.png";

const AppLoadingScreen = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: `url(${loadingBg})`,
      }}
    >
      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon hoặc Logo */}
        <div className="mb-8">
          <div className="w-20 h-20">
            <img src={logo} alt="logo" style={{ fontSize: 36, color: "white" }} />
          </div>
        </div>

        {/* Tên ứng dụng */}
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Chat<span className="text-purple-400">App</span>
        </h1>
        <p className="text-slate-400 text-sm mb-10">Chat & Cộng đồng</p>

        {/* Spinner */}
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 36, color: "#A78BFA" }} spin />}
        />

        {/* Text loading */}
        <p className="text-slate-400 mt-6 animate-pulse text-sm font-medium">
          Đang tải dữ liệu...
        </p>
      </div>

      {/* Dòng chân trang nhỏ */}
      <div className="absolute bottom-6 text-slate-500 text-xs">© 2026 ChatApp</div>
    </div>
  );
};

export default AppLoadingScreen;
