import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Spin, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

const ActivateAccount = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const activate = async () => {
            try {
                const res = await axiosClient.get(`/auth/activate/${code}`);
                setMsg(res.data.message || "Kích hoạt thành công!");
                setSuccess(true);
            } catch (err: any) {
                setMsg(err.response?.data?.message || "Kích hoạt thất bại!");
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        if (code) activate();
    }, [code]);

    useEffect(() => {
        if (!loading && success) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        navigate("/login");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 3000);

            return () => clearInterval(timer);
        }
    }, [loading, success, navigate]);

    const handleGoToLogin = () => {
        navigate("/login");
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
            <Card
                style={{
                    width: 450,
                    borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)"
                }}
                styles={{ body: { padding: 40, textAlign: "center" } }}
            >
                {loading ? (
                    <div>
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
                            <UserOutlined style={{ fontSize: 36, color: "white" }} />
                        </div>
                        <Title level={3} style={{ marginBottom: 24, color: "#595959" }}>
                            Đang kích hoạt tài khoản...
                        </Title>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: success
                                    ? "linear-gradient(135deg, #52c41a, #73d13d)"
                                    : "linear-gradient(135deg, #ff4d4f, #ff7875)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px",
                                boxShadow: success
                                    ? "0 10px 30px rgba(82, 196, 26, 0.3)"
                                    : "0 10px 30px rgba(255, 77, 79, 0.3)"
                            }}
                        >
                            {success ? (
                                <CheckCircleOutlined style={{ fontSize: 36, color: "white" }} />
                            ) : (
                                <CloseCircleOutlined style={{ fontSize: 36, color: "white" }} />
                            )}
                        </div>

                        <Title
                            level={2}
                            style={{
                                margin: "0 0 16px 0",
                                background: success
                                    ? "linear-gradient(135deg, #52c41a, #73d13d)"
                                    : "linear-gradient(135deg, #ff4d4f, #ff7875)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}
                        >
                            {success ? "Kích hoạt thành công!" : "Kích hoạt thất bại!"}
                        </Title>

                        <div
                            style={{
                                padding: "16px 20px",
                                background: success
                                    ? "linear-gradient(135deg, #f6ffed, #e6f7ff)"
                                    : "linear-gradient(135deg, #fff2f0, #ffe7e6)",
                                border: success ? "1px solid #52c41a" : "1px solid #ff4d4f",
                                borderRadius: 8,
                                marginBottom: 24,
                                boxShadow: success
                                    ? "0 2px 8px rgba(82, 196, 26, 0.15)"
                                    : "0 2px 8px rgba(255, 77, 79, 0.15)"
                            }}
                        >
                            <Text
                                style={{
                                    color: success ? "#389e0d" : "#cf1322",
                                    fontSize: 15,
                                    fontWeight: 500,
                                    lineHeight: 1.5
                                }}
                            >
                                {msg}
                            </Text>
                        </div>

                        {success ? (
                            <div style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        display: "block",
                                        marginBottom: 16,
                                        color: "#8c8c8c",
                                        fontSize: 14
                                    }}
                                >
                                    Bạn sẽ được chuyển hướng về trang đăng nhập trong {countdown} giây...
                                </Text>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleGoToLogin}
                                    style={{
                                        height: 50,
                                        borderRadius: 12,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                                        border: "none",
                                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                                        transition: "all 0.3s ease",
                                        minWidth: 180
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
                                    Đến trang đăng nhập
                                </Button>
                            </div>
                        ) : (
                            <div style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        display: "block",
                                        marginBottom: 16,
                                        color: "#8c8c8c",
                                        fontSize: 14
                                    }}
                                >
                                    Vui lòng thử lại hoặc liên hệ hỗ trợ
                                </Text>
                                <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handleGoToLogin}
                                        style={{
                                            height: 46,
                                            borderRadius: 12,
                                            fontSize: 15,
                                            fontWeight: 600,
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            border: "none",
                                            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            const target = e.currentTarget as HTMLElement;
                                            target.style.transform = "translateY(-2px)";
                                            target.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.4)";
                                        }}
                                        onMouseLeave={(e) => {
                                            const target = e.currentTarget as HTMLElement;
                                            target.style.transform = "translateY(0)";
                                            target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.3)";
                                        }}
                                    >
                                        Về trang đăng nhập
                                    </Button>
                                    <Button
                                        size="large"
                                        onClick={() => navigate("/register")}
                                        style={{
                                            height: 46,
                                            borderRadius: 12,
                                            fontSize: 15,
                                            fontWeight: 600,
                                            border: "2px solid #667eea",
                                            color: "#667eea",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            const target = e.currentTarget as HTMLElement;
                                            target.style.background = "#667eea";
                                            target.style.color = "white";
                                            target.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            const target = e.currentTarget as HTMLElement;
                                            target.style.background = "transparent";
                                            target.style.color = "#667eea";
                                            target.style.transform = "translateY(0)";
                                        }}
                                    >
                                        Đăng ký lại
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ActivateAccount;
