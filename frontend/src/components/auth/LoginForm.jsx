import { Link } from "react-router-dom";
import { Button, Form, Input } from "antd";

const LoginForm = ({ loading, onSubmit }) => {
  const [form] = Form.useForm();

  // Tạo hàm handleFinish để Antd cô lập luồng submit dữ liệu
  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
        <label htmlFor="username" className="mb-2 block text-sm font-medium text-white">
          Username
        </label>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên đăng nhập!",
            },
            {
              min: 3,
              message: "Tên đăng nhập phải có ít nhất 3 ký tự!",
            },
            {
              max: 30,
              message: "Tên đăng nhập không được vượt quá 30 ký tự!",
            },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_)!",
            },
          ]}
        >
          <Input disabled={loading} className="!bg-white/20 !text-white" />
        </Form.Item>

        <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">
          Password
        </label>
        <Form.Item
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
          <Input.Password
            disabled={loading}
            autoComplete="current-password"
            className="!bg-white/20 !text-white"
          />
        </Form.Item>

        <div>
          <Link
            to="/forgot-password"
            className="block w-fit ml-auto font-bold mb-2 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="!font-medium"
          >
            Login
          </Button>
        </Form.Item>
      </Form>

      <div className="flex items-center justify-center gap-1">
        <span className="text-sm text-[var(--color-text-secondary)]">
          Don't have an account?
        </span>
        <Link
          to="/register"
          className="text-sm text-[var(--color-primary)] font-bold hover:underline"
        >
          Register
        </Link>
      </div>
    </>
  );
};

export default LoginForm;
