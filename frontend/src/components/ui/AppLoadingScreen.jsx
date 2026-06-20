import { Spin } from "antd";
import { LoadingOutlined, MessageOutlined } from "@ant-design/icons";

const AppLoadingScreen = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Nền trang trí */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />

      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon hoặc Logo */}
        <div className="mb-8">
          <div className="w-20 h-20">
            <img src="/logo.svg.png" style={{ fontSize: 36, color: "white" }} />
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
