import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthState, loginUser } from "@/store/authSlice";
import { useNotification } from "@/hooks/useNotification";
import { useEffect, useState } from "react";
import { Button, Card, Checkbox, Form, Input, Typography } from "antd";

const { Text, Title } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const [error, setError] = useState(null);

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
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra");

      notification.error({
        message: "Đăng nhập thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <section id="login">
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <Card className="w-[400px] shadow-lg">
          <Title level={3} className="text-center mb-4">
            Đăng nhập
          </Title>

          <Form
            form={form}
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                {
                  type: "email",
                  message: "Email không hợp lệ",
                },
                {
                  max: 254,
                  message: "Email quá dài",
                },
              ]}
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
                {
                  min: 6,
                  message: "Mật khẩu phải có tối thiểu 6 ký tự",
                },
                {
                  max: 128,
                  message: "Mật khẩu quá dài",
                },
              ]}
            >
              <Input.Password disabled={loading} autoComplete="current-password" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox disabled={loading}>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            {/* Hiển thị lỗi */}
            <div className="mb-2">
              {error && (
                <Text type="danger" className="text-sm italic">
                  * {error}
                </Text>
              )}
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={loading}
                loading={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-2">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Đăng ký
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default LoginPage;
