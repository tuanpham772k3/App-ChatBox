import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Checkbox, Form, Input, Typography } from "antd";
import { useNotification } from "@/hooks/useNotification";
import authApi from "@/services/authApi";

const { Title } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const notification = useNotification();

  const onFinish = async (values) => {
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

      notification.success({
        message: "Đăng ký thành công!",
        description: "Hãy đăng nhập để vào hệ thống",
      });

      form.resetFields();
      navigate("/login");
    } catch (err) {
      notification.error({
        message: "Đăng ký thất bại",
        description: err.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="register">
      <div className="container mx-auto min-h-screen flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-[25rem] shadow-lg">
          {/* Title */}
          <Title level={3} className="text-center">
            Đăng ký
          </Title>

          {/* Form AntD (layout vertical) */}
          <Form
            form={form}
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Username */}
            <Form.Item
              label="Tên hiển thị"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên người dùng!",
                },
              ]}
            >
              <Input placeholder="nguyen_van_a" disabled={loading} />
            </Form.Item>

            {/* Email */}
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
              <Input placeholder="abc123@gmail.com" disabled={loading} />
            </Form.Item>

            {/* Password */}
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
                //có thể thêm pattern để yêu cầu ký tự đặc biệt / số / hoa thường
              ]}
            >
              <Input.Password
                placeholder="Mật khẩu chưa ít nhất 6 ký tự"
                disabled={loading}
              />
            </Form.Item>

            {/* Confirm Password  */}
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" disabled={loading} />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox disabled={loading}>Chấp nhận điều khoản & điều kiện</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={loading}
                loading={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-2">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
            >
              Đăng nhập
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default RegisterPage;
