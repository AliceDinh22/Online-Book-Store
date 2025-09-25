import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Typography, Spin, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PayPalResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [status, setStatus] = useState<"success" | "cancel" | "failed">("failed");
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = (queryParams.get("status") as "success" | "cancel" | "failed") || "failed";

        setStatus(paymentStatus);
        setMsg(
            paymentStatus === "success"
                ? "Thanh toán thành công!"
                : paymentStatus === "cancel"
                ? "Bạn đã hủy giao dịch."
                : "Thanh toán thất bại!"
        );
        setSuccess(paymentStatus === "success");
        setLoading(false);
    }, [location.search]);

    // ⏳ Đếm ngược nếu thanh toán thành công
    useEffect(() => {
        if (!loading && success) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        navigate("/dashboard");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, success, navigate]);

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
                        <Title level={3} style={{ marginBottom: 24, color: "#595959" }}>
                            Đang xử lý thanh toán...
                        </Title>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div>
                        {/* Icon hiển thị trạng thái */}
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background:
                                    status === "success"
                                        ? "linear-gradient(135deg, #52c41a, #73d13d)"
                                        : status === "cancel"
                                        ? "linear-gradient(135deg, #faad14, #ffc53d)"
                                        : "linear-gradient(135deg, #ff4d4f, #ff7875)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px",
                                boxShadow:
                                    status === "success"
                                        ? "0 10px 30px rgba(82, 196, 26, 0.3)"
                                        : status === "cancel"
                                        ? "0 10px 30px rgba(250, 173, 20, 0.3)"
                                        : "0 10px 30px rgba(255, 77, 79, 0.3)"
                            }}
                        >
                            {status === "success" ? (
                                <CheckCircleOutlined style={{ fontSize: 36, color: "white" }} />
                            ) : status === "cancel" ? (
                                <StopOutlined style={{ fontSize: 36, color: "white" }} />
                            ) : (
                                <CloseCircleOutlined style={{ fontSize: 36, color: "white" }} />
                            )}
                        </div>

                        {/* Tiêu đề */}
                        <Title
                            level={2}
                            style={{
                                margin: "0 0 16px 0",
                                background:
                                    status === "success"
                                        ? "linear-gradient(135deg, #52c41a, #73d13d)"
                                        : status === "cancel"
                                        ? "linear-gradient(135deg, #faad14, #ffc53d)"
                                        : "linear-gradient(135deg, #ff4d4f, #ff7875)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}
                        >
                            {msg}
                        </Title>

                        {/* Nội dung */}
                        <div
                            style={{
                                padding: "16px 20px",
                                background:
                                    status === "success"
                                        ? "linear-gradient(135deg, #f6ffed, #e6f7ff)"
                                        : status === "cancel"
                                        ? "linear-gradient(135deg, #fffbe6, #fff1b8)"
                                        : "linear-gradient(135deg, #fff2f0, #ffe7e6)",
                                border:
                                    status === "success"
                                        ? "1px solid #52c41a"
                                        : status === "cancel"
                                        ? "1px solid #faad14"
                                        : "1px solid #ff4d4f",
                                borderRadius: 8,
                                marginBottom: 24,
                                boxShadow:
                                    status === "success"
                                        ? "0 2px 8px rgba(82, 196, 26, 0.15)"
                                        : status === "cancel"
                                        ? "0 2px 8px rgba(250, 173, 20, 0.15)"
                                        : "0 2px 8px rgba(255, 77, 79, 0.15)"
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        status === "success" ? "#389e0d" : status === "cancel" ? "#d48806" : "#cf1322",
                                    fontSize: 15,
                                    fontWeight: 500,
                                    lineHeight: 1.5
                                }}
                            >
                                {status === "success"
                                    ? "Cảm ơn bạn đã thanh toán. Hệ thống sẽ xử lý đơn hàng ngay."
                                    : status === "cancel"
                                    ? "Bạn đã hủy giao dịch. Đơn hàng chưa được thanh toán."
                                    : "Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại."}
                            </Text>
                        </div>

                        {/* Nút điều hướng */}
                        <div style={{ marginBottom: 24 }}>
                            {status === "success" ? (
                                <>
                                    <Text
                                        style={{
                                            display: "block",
                                            marginBottom: 16,
                                            color: "#8c8c8c",
                                            fontSize: 14
                                        }}
                                    >
                                        Bạn sẽ được chuyển hướng về Dashboard trong {countdown} giây...
                                    </Text>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => navigate("/dashboard")}
                                        style={{
                                            height: 50,
                                            borderRadius: 12,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            border: "none",
                                            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                                            minWidth: 180
                                        }}
                                    >
                                        Về Dashboard
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    size="large"
                                    onClick={() => navigate("/dashboard")}
                                    style={{
                                        height: 46,
                                        borderRadius: 12,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        border: "2px solid #667eea",
                                        color: "#667eea"
                                    }}
                                >
                                    Quay lại trang chủ
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PayPalResult;
