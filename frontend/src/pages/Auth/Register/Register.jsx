import { Button, Card, Checkbox, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/features/auth/authSlice";
import { useNotification } from "@/hooks/useNotification";
import { Link } from "react-router-dom";

const Register = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    const notification = useNotification();

    const onFinish = async (values) => {
        try {
            const res = await dispatch(registerUser(values)).unwrap();

            console.log("API Response:", res); // debug
            // Điều kiên đăng ký thành công
            if (res && res.idCode === 0) {
                // Thông báo
                notification.success({
                    message: "Successful!",
                    description: res.message || "Register successful!",
                });
            }
        } catch (err) {
            console.log("err:", err); // debug
            //Xử lý lỗi dựa trên idCode
            switch (err.idCode) {
                case 1:
                    notification.warning({
                        message: "Lack of information",
                        description: err.message || "Username, Email, password are required!",
                    });
                    break;
                case 2:
                    notification.warning({
                        message: "Failed",
                        description: err.message || "Email already exists!",
                    });
                    break;
                case 3:
                    notification.warning({
                        message: "System error!",
                        description: err.message || "Internal server error!",
                    });
                    break;
                default:
                    notification.error({
                        message: "Đăng ký thất bại",
                        description: err.message || "Lỗi không xác định!",
                    });
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-[400px] shadow-lg">
                {/* Title */}
                <Title level={3} className="text-center mb-4">
                    Đăng ký
                </Title>

                {/* Form AntD (layout vertical) */}
                <Form
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
                        rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}
                    >
                        <Input placeholder="nguyen_van_a" disabled={loading} />
                    </Form.Item>

                    {/* Email */}
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                    >
                        <Input placeholder="abc123@gmail.com" disabled={loading} />
                    </Form.Item>

                    {/* Password */}
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                            { min: 6, message: "Mật khẩu phải có tối thiểu 6 ký tự" },
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
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            // Confirm password
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Mật khẩu xác nhận không khớp!")
                                    );
                                },
                            }),
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
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
                {/* ✅ Thêm phần “Đã có tài khoản? Đăng nhập” */}
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

export default Register;
