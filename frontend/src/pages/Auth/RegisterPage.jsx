import { Button, Card, Checkbox, Form, Input, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, clearAuthState } from "@/store/authSlice";
import { useNotification } from "@/hooks/useNotification";
import { useEffect } from "react";

const { Text, Title } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { isLoading, isError } = useSelector((state) => state.auth);
  const notification = useNotification();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { confirmPassword, ...info } = values;

    if (confirmPassword !== info.password) {
      notification.error({
        message: "Mật khẩu không trùng khớp!",
        description: "Vui lòng kiểm tra lại mật khẩu và mật khẩu xác nhận của bạn.",
      });
      return;
    }

    try {
      await dispatch(registerUser(info)).unwrap();

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
    }
  };

  // Reset state khi component unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthState());
    };
  }, [dispatch]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px] shadow-lg">
        {/* Title */}
        <Title level={3} className="text-center mb-4">
          Đăng ký
        </Title>

        {/* Form AntD (layout vertical) */}
        <Form
          onValuesChange={() => {
            if (isError) dispatch(clearAuthState());
          }}
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
            <Input placeholder="nguyen_van_a" disabled={isLoading} />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input placeholder="abc123@gmail.com" disabled={isLoading} />
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
              disabled={isLoading}
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
            <Input.Password placeholder="Nhập lại mật khẩu" disabled={isLoading} />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox disabled={isLoading}>Chấp nhận điều khoản & điều kiện</Checkbox>
          </Form.Item>

          {/* Hiển thị lỗi */}
          <div className="mb-2">
            {isError && (
              <Text type="danger" className="text-sm italic">
                * {isError}
              </Text>
            )}
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-2">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
