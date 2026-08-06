import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import authApi from "@/services/authApi";
import RegisterForm from "@/components/auth/RegisterForm";
import registerBg from "@/assets/images/register-bg.jpg";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const notification = useNotification();

  const handleRegister = async (values) => {
    const { confirmPassword, ...info } = values;

    if (confirmPassword !== info.password) {
      notification.error({
        message: "Mật khẩu không trùng khớp!",
        description: "Vui lòng kiểm tra lại mật khẩu và mật khẩu xác nhận của bạn.",
      });
      return;
    }

    setLoading(true);

    try {
      await authApi.register(info);

      // Chỉ tắt loading khi chuyển trang thành công để tránh re-render trùng lặp
      setTimeout(() => {
        navigate("/chat");
      }, 100);

      notification.success({
        message: "Đăng ký thành công!",
        description: "Hãy đăng nhập để vào hệ thống",
      });

      form.resetFields();
    } catch (err) {
      notification.error({
        message: "Đăng ký thất bại",
        description: err.message || "Có lỗi xảy ra",
      });

      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${registerBg})`,
      }}
    >
      <div className="container mx-auto min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[25rem] shadow-2xl rounded-2xl backdrop-blur-3xl bg-white/10 p-8">
          <h1 className="text-2xl font-bold text-center text-white mb-4">Register</h1>

          <RegisterForm loading={loading} onSubmit={handleRegister} />
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
