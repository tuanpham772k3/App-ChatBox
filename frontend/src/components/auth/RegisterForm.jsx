import { Link } from "react-router-dom";
import { Button, Col, Form, Input, Row } from "antd";

const RegisterForm = ({ loading, onSubmit }) => {
  const [form] = Form.useForm();

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onSubmit}
        autoComplete="off"
      >
        {/* Display Name */}
        <Row gutter={12}>
          <Col span={12}>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium text-white"
            >
              First Name
            </label>
            <Form.Item
              name="firstName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ!",
                },
                {
                  max: 50,
                  message: "Họ không được vượt quá 50 ký tự!",
                },
              ]}
            >
              <Input disabled={loading} className="!bg-white/20 !text-white" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-medium text-white"
            >
              Last Name
            </label>
            <Form.Item
              name="lastName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên!",
                },
                {
                  max: 50,
                  message: "Tên không được vượt quá 50 ký tự!",
                },
              ]}
            >
              <Input disabled={loading} className="!bg-white/20 !text-white" />
            </Form.Item>
          </Col>
        </Row>

        {/* Username */}
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

        {/* Email */}
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
          Email
        </label>
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập email!",
            },
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
          <Input disabled={loading} className="!bg-white/20 !text-white" />
        </Form.Item>

        {/* Password */}
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
          <Input.Password disabled={loading} className="!bg-white/20 !text-white" />
        </Form.Item>

        {/* Confirm Password */}
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-white"
        >
          Confirm Password
        </label>
        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            {
              required: true,
              message: "Vui lòng xác nhận mật khẩu!",
            },
          ]}
        >
          <Input.Password disabled={loading} className="!bg-white/20 !text-white" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={loading}
            className="!font-medium mt-4"
          >
            {loading ? "Processing..." : "Register"}
          </Button>
        </Form.Item>
      </Form>

      <div className="flex items-center justify-center gap-1">
        <span className="text-sm text-[var(--color-text-secondary)]">
          Already have an account?
        </span>{" "}
        <Link
          to="/login"
          className="text-sm text-[var(--color-primary)] font-bold hover:underline"
        >
          Login
        </Link>
      </div>
    </>
  );
};

export default RegisterForm;
