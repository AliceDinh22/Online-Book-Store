import React from "react";
import { Form, Input, Button, message, Card, Typography, Space } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import axiosClient from "../api/axiosClient";
import { loginSuccess } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await axiosClient.post("auth/login", {
                email: values.email,
                password: values.password
            });

            const { data } = res.data;
            dispatch(loginSuccess({ token: data.token, user: data.user, role: data.user.role }));
            messageApi.success(res.data.message);

            navigate("/dashboard");
        } catch (err: any) {
            messageApi.error(err.response?.data?.message || "Đăng nhập thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "20px"
            }}
        >
            {contextHolder}
            <Card
                style={{
                    width: 420,
                    borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)"
                }}
                bodyStyle={{ padding: 40 }}
            >
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
                        }}
                    >
                        <UserOutlined style={{ fontSize: 36, color: "white" }} />
                    </div>
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                        }}
                    >
                        Chào mừng trở lại
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Đăng nhập để tiếp tục
                    </Text>
                </div>

                <Form name="login" onFinish={onFinish} layout="vertical" size="large">
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: "#8c8c8c" }} />}
                            placeholder="Nhập email của bạn"
                            style={{
                                height: 50,
                                borderRadius: 12,
                                fontSize: 16,
                                border: "2px solid #f0f0f0",
                                transition: "all 0.3s ease"
                            }}
                            onFocus={(e) => {
                                e.target.style.border = "2px solid #667eea";
                                e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.border = "2px solid #f0f0f0";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
                        <Input.Password
                            prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                            placeholder="Nhập mật khẩu"
                            style={{
                                height: 50,
                                borderRadius: 12,
                                fontSize: 16,
                                border: "2px solid #f0f0f0",
                                transition: "all 0.3s ease"
                            }}
                            onFocus={(e) => {
                                e.target.style.border = "2px solid #667eea";
                                e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.border = "2px solid #f0f0f0";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 16 }}>
                        <div style={{ textAlign: "right" }}>
                            <Text
                                type="secondary"
                                style={{
                                    cursor: "pointer",
                                    transition: "color 0.3s ease"
                                }}
                                onClick={() => navigate("/forgot-password")}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.color = "#667eea";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.color = "#8c8c8c";
                                }}
                            >
                                Quên mật khẩu?
                            </Text>
                        </div>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{
                                height: 50,
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 600,
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                const btn = e.currentTarget as HTMLButtonElement;
                                btn.style.transform = "translateY(-2px)";
                                btn.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                const btn = e.currentTarget as HTMLButtonElement;
                                btn.style.transform = "translateY(0)";
                                btn.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.3)";
                            }}
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: "center", marginTop: 32 }}>
                    <Space>
                        <Text type="secondary">Chưa có tài khoản?</Text>
                        <Text
                            style={{
                                color: "#667eea",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.color = "#764ba2";
                                el.style.textDecoration = "underline";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.color = "#667eea";
                                el.style.textDecoration = "none";
                            }}
                            onClick={() => navigate("/register")}
                        >
                            Đăng ký ngay
                        </Text>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default Login;
