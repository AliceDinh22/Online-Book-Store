import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message, Card, Spin } from "antd";
import { LockOutlined, KeyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

const ResetPassword = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [countdown, setCountdown] = useState<number | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const res = await axiosClient.get(`/auth/reset/${code}`);
                setEmail(res.data.data);
            } catch (err: any) {
                messageApi.error(err.response?.data?.message || "Mã không hợp lệ");
                navigate("/forgot-password");
            } finally {
                setInitialLoading(false);
            }
        };
        if (code) fetchEmail();
    }, [code, navigate]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await axiosClient.post(`/auth/reset`, {
                email,
                password: values.password,
                password2: values.confirmPassword
            });
            const successMsg = res.data.message || "Đặt lại mật khẩu thành công!";
            messageApi.success(successMsg);
            setSuccessMessage(successMsg);

            // Start countdown
            let timeLeft = 3;
            setCountdown(timeLeft);
            const timer = setInterval(() => {
                timeLeft--;
                setCountdown(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    navigate("/login");
                }
            }, 1000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Đặt lại mật khẩu thất bại!";
            message.error(errorMsg);
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
                    width: 450,
                    borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)"
                }}
                bodyStyle={{ padding: 40 }}
            >
                {initialLoading ? (
                    <div style={{ textAlign: "center" }}>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px",
                                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
                            }}
                        >
                            <KeyOutlined style={{ fontSize: 36, color: "white" }} />
                        </div>
                        <Title level={3} style={{ marginBottom: 24, color: "#595959" }}>
                            Đang xác thực mã...
                        </Title>
                        <Spin size="large" />
                    </div>
                ) : successMessage ? (
                    <div style={{ textAlign: "center" }}>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #52c41a, #73d13d)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px",
                                boxShadow: "0 10px 30px rgba(82, 196, 26, 0.3)"
                            }}
                        >
                            <CheckCircleOutlined style={{ fontSize: 36, color: "white" }} />
                        </div>
                        <Title
                            level={2}
                            style={{
                                margin: "0 0 16px 0",
                                background: "linear-gradient(135deg, #52c41a, #73d13d)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}
                        >
                            Thành công!
                        </Title>
                        <div
                            style={{
                                padding: "16px 20px",
                                background: "linear-gradient(135deg, #f6ffed, #e6f7ff)",
                                border: "1px solid #52c41a",
                                borderRadius: 8,
                                marginBottom: 24,
                                boxShadow: "0 2px 8px rgba(82, 196, 26, 0.15)"
                            }}
                        >
                            <Text
                                style={{
                                    color: "#389e0d",
                                    fontSize: 15,
                                    fontWeight: 500,
                                    lineHeight: 1.5
                                }}
                            >
                                {successMessage}
                            </Text>
                            {countdown !== null && (
                                <Text
                                    style={{
                                        display: "block",
                                        marginTop: 8,
                                        color: "#8c8c8c",
                                        fontSize: 13
                                    }}
                                >
                                    Chuyển hướng về trang đăng nhập trong {countdown} giây...
                                </Text>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
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
                                <KeyOutlined style={{ fontSize: 36, color: "white" }} />
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
                                Đặt lại mật khẩu
                            </Title>
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                Nhập mật khẩu mới cho tài khoản của bạn
                            </Text>
                            {email && (
                                <Text
                                    type="secondary"
                                    style={{
                                        display: "block",
                                        fontSize: 14,
                                        marginTop: 8,
                                        color: "#667eea",
                                        fontWeight: 500
                                    }}
                                >
                                    {email}
                                </Text>
                            )}
                        </div>

                        <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
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
                                    placeholder="Xác nhận mật khẩu mới"
                                    prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                                    style={inputStyle}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </Form.Item>

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
                                    {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: "center" }}>
                            <div style={{ marginBottom: 12 }}>
                                <Text type="secondary">Nhớ mật khẩu? </Text>
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
                            </div>
                            <div>
                                <Text type="secondary">Chưa có tài khoản? </Text>
                                <Text
                                    style={{
                                        color: "#667eea",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                    onClick={() => navigate("/register")}
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
                                    Đăng ký ngay
                                </Text>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default ResetPassword;
