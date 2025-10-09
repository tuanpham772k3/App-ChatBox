import { Button, Card, Checkbox, Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/features/auth/authSlice";
import { useNotification } from "@/hooks/useNotification";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    const notification = useNotification();

    console.log("notification object:", notification);
    const onFinish = (values) => {
        dispatch(loginUser(values))
            .unwrap() //Bắt err rejectWithValue
            .then((res) => {
                console.log("API Response:", res); // debug
                // Điều kiên thành công
                if (res && res.idCode === 0) {
                    // Thông báo
                    notification.success({
                        message: "Successful!",
                        description: res.message || "Login successful!",
                    });
                    console.log("Notification called!");
                    navigate("/"); // chuyển hướng
                }
            })
            .catch((err) => {
                console.log("err:", err); // debug
                //Xử lý lỗi dựa trên idCode
                switch (err.idCode) {
                    case 1:
                        notification.warning({
                            message: "Lack of information",
                            description: "Email, password are required!",
                        });
                        break;
                    case 2:
                        notification.warning({
                            message: "Failed",
                            description: "Invalid email or password!",
                        });
                        break;
                    case 3:
                        notification.warning({
                            message: "System error!",
                            description: "Internal server error!",
                        });
                        break;
                    default:
                        notification.error({
                            message: "Đăng nhập thất bại",
                            description: err.message || "Lỗi không xác định!",
                        });
                }
            });
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
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
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
