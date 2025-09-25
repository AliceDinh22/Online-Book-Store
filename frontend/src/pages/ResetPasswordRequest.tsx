import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { MailOutlined, SendOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ResetPasswordRequest = () => {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/auth/forgot/${values.email}`);
            const successMsg = res.data.message || "Gửi mã đặt lại mật khẩu thành công!";
            messageApi.success(successMsg);
            setSuccessMessage(successMsg);

            // Redirect đến trang reset password sau 2 giây
            setTimeout(() => {
                navigate(`/reset/${values.email}`);
            }, 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Gửi mã thất bại!";
            messageApi.error(errorMsg);
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
                        <SendOutlined style={{ fontSize: 36, color: "white" }} />
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
                        Quên mật khẩu?
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16, lineHeight: 1.5 }}>
                        Nhập email để nhận mã đặt lại mật khẩu
                    </Text>
                </div>

                <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
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

                    {successMessage && (
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: 16,
                                padding: "12px 16px",
                                background: "linear-gradient(135deg, #f6ffed, #e6f7ff)",
                                border: "1px solid #52c41a",
                                borderRadius: 8,
                                boxShadow: "0 2px 8px rgba(82, 196, 26, 0.15)"
                            }}
                        >
                            <Text
                                style={{
                                    color: "#389e0d",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    lineHeight: 1.5
                                }}
                            >
                                {successMessage}
                            </Text>
                            <Text
                                style={{
                                    display: "block",
                                    marginTop: 8,
                                    color: "#8c8c8c",
                                    fontSize: 13
                                }}
                            >
                                Chuyển hướng trong 2 giây...
                            </Text>
                        </div>
                    )}

                    <Form.Item style={{ marginBottom: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            disabled={!!successMessage}
                            style={{
                                height: 50,
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 600,
                                background: successMessage ? "#d9d9d9" : "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: successMessage ? "none" : "0 8px 24px rgba(102, 126, 234, 0.3)",
                                transition: "all 0.3s ease",
                                cursor: successMessage ? "not-allowed" : "pointer"
                            }}
                            onMouseEnter={(e) => {
                                if (!successMessage) {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.transform = "translateY(-2px)";
                                    target.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.4)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!successMessage) {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.transform = "translateY(0)";
                                    target.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.3)";
                                }
                            }}
                        >
                            {loading ? "Đang gửi..." : "Gửi mã đặt lại"}
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
            </Card>
        </div>
    );
};

export default ResetPasswordRequest;
