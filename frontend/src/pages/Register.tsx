import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography, Space, Row, Col } from "antd";
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    UserAddOutlined,
    PhoneOutlined,
    HomeOutlined,
    EnvironmentOutlined
} from "@ant-design/icons";
import ReCAPTCHA from "react-google-recaptcha";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        if (!captchaToken) {
            message.error("Vui lòng xác thực captcha!");
            return;
        }
        setLoading(true);
        try {
            const res = await axiosClient.post("/auth/register", {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
                password2: values.confirmPassword,
                captcha: captchaToken,
                phoneNumber: values.phoneNumber,
                address: values.address,
                city: values.city
            });
            messageApi.success(res.data.message);
            setSuccessMessage(res.data.message);
        } catch (err: any) {
            messageApi.error(err.response?.data?.message || "Đăng ký thất bại!");
            setErrorMessage(err.response?.data?.message || "Đăng ký thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        height: 48,
        borderRadius: 12,
        fontSize: 16,
        border: "2px solid #f0f0f0",
        transition: "all 0.3s ease"
    };

    const handleInputFocus = (e: any) => {
        e.target.style.border = "2px solid #667eea";
        e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
    };

    const handleInputBlur = (e: any) => {
        e.target.style.border = "2px solid #f0f0f0";
        e.target.style.boxShadow = "none";
    };

    const socialButtonStyle = {
        width: 50,
        height: 50,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "2px solid #f0f0f0",
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
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
                    width: 480,
                    borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)"
                }}
                bodyStyle={{ padding: 40 }}
            >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
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
                        <UserAddOutlined style={{ fontSize: 36, color: "white" }} />
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
                        Tạo tài khoản mới
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Điền thông tin để bắt đầu
                    </Text>
                </div>

                <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="firstName" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
                                <Input
                                    placeholder="Tên"
                                    prefix={<UserOutlined style={{ color: "#8c8c8c" }} />}
                                    style={inputStyle}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="lastName" rules={[{ required: true, message: "Vui lòng nhập họ!" }]}>
                                <Input
                                    placeholder="Họ"
                                    prefix={<UserOutlined style={{ color: "#8c8c8c" }} />}
                                    style={inputStyle}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input
                            placeholder="Nhập email của bạn"
                            prefix={<MailOutlined style={{ color: "#8c8c8c" }} />}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!"
                            }
                        ]}
                    >
                        <Input.Password
                            placeholder="Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!"
                            prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                                }
                            })
                        ]}
                    >
                        <Input.Password
                            placeholder="Xác nhận mật khẩu"
                            prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </Form.Item>
                    <Form.Item
                        name="phoneNumber"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                            { pattern: /^[0-9]{9,11}$/, message: "Sai định dạng số điện thoại!" }
                        ]}
                    >
                        <Input
                            placeholder="Số điện thoại"
                            prefix={<PhoneOutlined style={{ color: "#8c8c8c" }} />}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </Form.Item>

                    <Form.Item name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
                        <Input
                            placeholder="Địa chỉ"
                            prefix={<EnvironmentOutlined style={{ color: "#8c8c8c" }} />}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </Form.Item>

                    <Form.Item name="city" rules={[{ required: true, message: "Vui lòng nhập thành phố!" }]}>
                        <Input
                            placeholder="Thành phố"
                            prefix={<HomeOutlined style={{ color: "#8c8c8c" }} />}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: "center" }}>
                        <ReCAPTCHA
                            sitekey="6LcEF70rAAAAAMszyM3yGupt-o0iUG1ctEgbR43Y"
                            onChange={(token: any) => setCaptchaToken(token)}
                            style={{
                                display: "inline-block",
                                transform: "scale(0.9)",
                                transformOrigin: "center"
                            }}
                        />
                    </Form.Item>

                    {successMessage && <Text type="success">{successMessage}</Text>}
                    {errorMessage && <Text type="danger">{errorMessage}</Text>}

                    <Form.Item style={{ marginBottom: 24 }}>
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
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(-2px)";
                                target.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(0)";
                                target.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.3)";
                            }}
                        >
                            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            margin: "20px 0",
                            color: "#8c8c8c"
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                background: "linear-gradient(to right, transparent, #e8e8e8, transparent)"
                            }}
                        />
                        <Text type="secondary" style={{ margin: "0 16px", fontSize: 14 }}>
                            Hoặc đăng ký với
                        </Text>
                        <div
                            style={{
                                flex: 1,
                                height: "1px",
                                background: "linear-gradient(to right, transparent, #e8e8e8, transparent)"
                            }}
                        />
                    </div>

                    <Space size={16}>
                        <div
                            style={{
                                ...socialButtonStyle,
                                background: "linear-gradient(135deg, #ea4335, #fbbc05)"
                            }}
                            onClick={() => (window.location.href = "/oauth2/authorize/google")}
                            onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(-3px)";
                                target.style.boxShadow = "0 8px 24px rgba(234, 53, 71, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(0)";
                                target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                            title="Đăng nhập với Google"
                        >
                            <span
                                style={{
                                    color: "white",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    fontFamily: "Arial, sans-serif"
                                }}
                            >
                                G
                            </span>
                        </div>

                        {/* Facebook Button */}
                        <div
                            style={{
                                ...socialButtonStyle,
                                background: "linear-gradient(135deg, #1877f2, #42a5f5)"
                            }}
                            onClick={() => (window.location.href = "/oauth2/authorize/facebook")}
                            onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(-3px)";
                                target.style.boxShadow = "0 8px 24px rgba(24, 119, 242, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(0)";
                                target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                            title="Đăng nhập với Facebook"
                        >
                            <span
                                style={{
                                    color: "white",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    fontFamily: "Arial, sans-serif"
                                }}
                            >
                                f
                            </span>
                        </div>

                        {/* GitHub Button */}
                        <div
                            style={{
                                ...socialButtonStyle,
                                background: "linear-gradient(135deg, #24292e, #586069)"
                            }}
                            onClick={() => (window.location.href = "/oauth2/authorize/github")}
                            onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(-3px)";
                                target.style.boxShadow = "0 8px 24px rgba(36, 41, 46, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.transform = "translateY(0)";
                                target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                            title="Đăng nhập với GitHub"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                        </div>
                    </Space>
                </div>

                <div style={{ textAlign: "center" }}>
                    <Space direction="vertical" size={8}>
                        <Space>
                            <Text type="secondary">Đã có tài khoản?</Text>
                            <Text
                                style={{
                                    color: "#667eea",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                }}
                                onClick={() => navigate("/login")}
                                onMouseEnter={(e) => {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.color = "#764ba2";
                                    target.style.textDecoration = "underline";
                                }}
                                onMouseLeave={(e) => {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.color = "#667eea";
                                    target.style.textDecoration = "none";
                                }}
                            >
                                Đăng nhập ngay
                            </Text>
                        </Space>
                        <Text
                            type="secondary"
                            style={{
                                cursor: "pointer",
                                transition: "color 0.3s ease",
                                fontSize: 14
                            }}
                            onClick={() => navigate("/forgot-password")}
                            onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.color = "#667eea";
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.color = "#8c8c8c";
                            }}
                        >
                            Quên mật khẩu?
                        </Text>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default Register;
