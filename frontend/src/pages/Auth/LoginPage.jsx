import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/store/authSlice";
import { useNotification } from "@/hooks/useNotification";
import LoginForm from "@/components/auth/LoginForm";
import loginBg from "@/assets/images/login-bg.jpg";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const notification = useNotification();

  const handleLogin = async (values) => {
    const { username, password } = values;

    setLoading(true);

    try {
      await dispatch(loginUser({ username, password })).unwrap();

      notification.success({
        message: "Đăng nhập thành công",
        description: "Chào mừng bạn quay lại hệ thống",
      });

      navigate("/chat");
    } catch (error) {
      notification.error({
        message: "Đăng nhập thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <div className="container mx-auto min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[25rem] shadow-lg rounded-2xl backdrop-blur-3xl bg-white/10 p-8">
          <h1 className="text-2xl font-bold text-center text-white mb-4">Login</h1>

          <LoginForm loading={loading} onSubmit={handleLogin} />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
