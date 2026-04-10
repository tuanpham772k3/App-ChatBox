import { Button, Card, Checkbox, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "@/store/authSlice";
import { useNotification } from "@/hooks/useNotification";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const notification = useNotification();

  const onFinish = async (values) => {
    const { email, password } = values;

    try {
      await dispatch(loginUser({ email, password })).unwrap();

      notification.success({
        message: "Đăng nhập thành công",
        description: "Chào mừng bạn quay lại hệ thống",
      });

      navigate("/");
    } catch (err) {
      notification.error({
        message: "Đăng nhập thất bại",
        description: err.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px] shadow-lg">
        <Title level={3} className="text-center mb-4">
          Đăng nhập
        </Title>

        <Form
          name="login"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input disabled={loading} />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password disabled={loading} autoComplete="current-password" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox disabled={loading}>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={loading}
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        {/* ✅ Thêm phần “Đã có tài khoản? Đăng nhập” */}
        <div className="text-center mt-2">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Đăng ký
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
