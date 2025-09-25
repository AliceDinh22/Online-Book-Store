import React, { useState, useEffect } from "react";
import { Card, List, Typography, Divider, Button, message, Input, Radio, Space, Row, Col, Avatar } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckoutState, OrderDTO } from "../types/types";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import axiosClient from "../api/axiosClient";
import {
    ShoppingCartOutlined,
    UserOutlined,
    CreditCardOutlined,
    EditOutlined,
    CheckOutlined,
    QrcodeOutlined,
    HomeOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();
    const [editing, setEditing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const { cart, totalPrice } = (location.state as CheckoutState) || {
        cart: [],
        totalPrice: 0
    };

    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id ?? null;
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
    const [address, setAddress] = useState(user?.address || "");
    const [city, setCity] = useState(user?.city || "");

    const EXCHANGE_RATE = 25000;

    const formatTotal = () => {
        if (paymentMethod === "PayPal") {
            const usd = totalPrice / EXCHANGE_RATE;
            return `$${usd.toFixed(2)}`;
        }
        return `${new Intl.NumberFormat("vi-VN").format(totalPrice)}₫`;
    };

    const generateQr = async () => {
        if (!cart || cart.length === 0 || !userId) return;

        const orderData: OrderDTO = {
            id: undefined,
            date: undefined,
            totalPrice,
            status: "PENDING",
            address,
            city,
            phoneNumber,
            userId,
            items: [],
            cartItemIds: cart.map((item) => item.id!),
            payment: {
                id: undefined,
                amount: totalPrice,
                currency: "VND",
                method: "QR",
                status: "PENDING",
                orderId: undefined,
                transactionId: undefined,
                createdAt: undefined,
                updatedAt: undefined
            }
        };

        try {
            setProcessing(true);
            const res = await axiosClient.post("/orders/sepay", orderData);
            setQrUrl(res.data.data);
            messageApi.success("Mã QR đã được tạo!");
        } catch (error: any) {
            messageApi.error("Không thể tạo mã QR: " + error.message);
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        if (paymentMethod === "QR") {
            generateQr();
        } else {
            setQrUrl(null);
        }
    }, [paymentMethod, cart, address, city, phoneNumber]);

    const createOrder = async (order: OrderDTO) => {
        try {
            if (paymentMethod === "PayPal") {
                const res = await axiosClient.post("/orders/paypal", order);
                return res.data;
            } else if (paymentMethod === "QR") {
                const res = await axiosClient.post("/orders/QR", order);
                return res.data;
            } else {
                const res = await axiosClient.post("/orders/COD", order);
                return res.data;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Lỗi khi tạo đơn hàng");
        }
    };

    const handleConfirm = async () => {
        if (!cart || cart.length === 0) {
            messageApi.warning("Giỏ hàng trống, không thể thanh toán!");
            return;
        }

        if (!phoneNumber.trim() || !address.trim() || !city.trim()) {
            messageApi.error("Vui lòng điền đầy đủ thông tin giao hàng!");
            return;
        }

        const orderData: OrderDTO = {
            id: undefined,
            date: undefined,
            totalPrice: paymentMethod === "PayPal" ? Number((totalPrice / EXCHANGE_RATE).toFixed(2)) : totalPrice,
            status: "PENDING",
            address: address.trim(),
            city: city.trim(),
            phoneNumber: phoneNumber.trim(),
            userId,
            items: [],
            cartItemIds: cart.map((item) => item.id!),
            payment: {
                id: undefined,
                amount: paymentMethod === "PayPal" ? Number((totalPrice / EXCHANGE_RATE).toFixed(2)) : totalPrice,
                currency: paymentMethod === "PayPal" ? "USD" : "VND",
                method: paymentMethod,
                status: "PENDING",
                orderId: undefined,
                transactionId: undefined,
                createdAt: undefined,
                updatedAt: undefined
            }
        };

        try {
            setProcessing(true);
            const res = await createOrder(orderData);

            if (paymentMethod === "PayPal" && res.data) {
                window.location.href = res.data;
            } else {
                messageApi.success(res.message || "Đặt hàng thành công!");
                navigate("/dashboard");
            }
        } catch (error: any) {
            messageApi.error(error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <AppHeader />
            <div
                style={{
                    padding: "32px 24px",
                    maxWidth: 1200,
                    margin: "0 auto",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    minHeight: "calc(100vh - 140px)"
                }}
            >
                {contextHolder}

                {/* Header Section */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <Title
                        level={2}
                        style={{
                            color: "#1a1a1a",
                            fontWeight: 700,
                            marginBottom: 8
                        }}
                    >
                        Xác nhận đơn hàng
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Kiểm tra thông tin và hoàn tất thanh toán
                    </Text>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Left Column - Customer Info & Items */}
                    <Col xs={24} lg={14}>
                        {/* Customer Information */}
                        {user && (
                            <Card
                                style={{
                                    marginBottom: 24,
                                    borderRadius: 16,
                                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                                    border: "none"
                                }}
                                bodyStyle={{ padding: 24 }}
                            >
                                <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                                    <Avatar
                                        size={48}
                                        icon={<UserOutlined />}
                                        style={{
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            marginRight: 16
                                        }}
                                    />
                                    <div>
                                        <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
                                            Thông tin giao hàng
                                        </Title>
                                        <Text type="secondary">Địa chỉ nhận hàng</Text>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: "#fafbfc",
                                        padding: 20,
                                        borderRadius: 12,
                                        border: "1px solid #e8e8e8"
                                    }}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col span={24}>
                                            <Text strong style={{ color: "#4a5568" }}>
                                                Họ tên:{" "}
                                            </Text>
                                            <Text style={{ fontSize: 15 }}>
                                                {user.firstName} {user.lastName}
                                            </Text>
                                        </Col>
                                        <Col span={24}>
                                            <Text strong style={{ color: "#4a5568" }}>
                                                Email:{" "}
                                            </Text>
                                            <Text style={{ fontSize: 15 }}>{user.email}</Text>
                                        </Col>
                                        <Col span={24}>
                                            <Text strong style={{ color: "#4a5568" }}>
                                                Số điện thoại:{" "}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: !phoneNumber.trim() ? "#ff4d4f" : "inherit",
                                                    fontSize: 15
                                                }}
                                            >
                                                *
                                            </Text>
                                            <br />
                                            {editing ? (
                                                <Input
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                    style={{
                                                        width: "100%",
                                                        marginTop: 8,
                                                        borderRadius: 8
                                                    }}
                                                    size="large"
                                                />
                                            ) : (
                                                <Text
                                                    style={{
                                                        fontSize: 15,
                                                        color: !phoneNumber.trim() ? "#bfbfbf" : "inherit"
                                                    }}
                                                >
                                                    {phoneNumber || "Chưa có thông tin"}
                                                </Text>
                                            )}
                                        </Col>
                                        <Col span={24}>
                                            <Text strong style={{ color: "#4a5568" }}>
                                                Địa chỉ:{" "}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: !address.trim() ? "#ff4d4f" : "inherit",
                                                    fontSize: 15
                                                }}
                                            >
                                                *
                                            </Text>
                                            <br />
                                            {editing ? (
                                                <Input
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Nhập địa chỉ chi tiết"
                                                    style={{
                                                        width: "100%",
                                                        marginTop: 8,
                                                        borderRadius: 8
                                                    }}
                                                    size="large"
                                                />
                                            ) : (
                                                <Text
                                                    style={{
                                                        fontSize: 15,
                                                        color: !address.trim() ? "#bfbfbf" : "inherit"
                                                    }}
                                                >
                                                    {address || "Chưa có thông tin"}
                                                </Text>
                                            )}
                                        </Col>
                                        <Col span={24}>
                                            <Text strong style={{ color: "#4a5568" }}>
                                                Thành phố:{" "}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: !city.trim() ? "#ff4d4f" : "inherit",
                                                    fontSize: 15
                                                }}
                                            >
                                                *
                                            </Text>
                                            <br />
                                            {editing ? (
                                                <Input
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="Nhập tên thành phố"
                                                    style={{
                                                        width: "100%",
                                                        marginTop: 8,
                                                        borderRadius: 8
                                                    }}
                                                    size="large"
                                                />
                                            ) : (
                                                <Text
                                                    style={{
                                                        fontSize: 15,
                                                        color: !city.trim() ? "#bfbfbf" : "inherit"
                                                    }}
                                                >
                                                    {city || "Chưa có thông tin"}
                                                </Text>
                                            )}
                                        </Col>
                                    </Row>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: 16
                                    }}
                                >
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <Text style={{ color: "#ff4d4f" }}>*</Text> Thông tin bắt buộc
                                    </Text>
                                    <Button
                                        type={editing ? "primary" : "default"}
                                        icon={editing ? <CheckOutlined /> : <EditOutlined />}
                                        onClick={() => setEditing(!editing)}
                                        style={{
                                            borderRadius: 8,
                                            fontWeight: 500,
                                            ...(editing && {
                                                background: "linear-gradient(135deg, #52c41a, #73d13d)",
                                                border: "none"
                                            })
                                        }}
                                    >
                                        {editing ? "Hoàn tất" : "Chỉnh sửa"}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Order Items */}
                        <Card
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                                border: "none"
                            }}
                            bodyStyle={{ padding: 24 }}
                        >
                            <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                                <ShoppingCartOutlined
                                    style={{
                                        fontSize: 24,
                                        color: "#667eea",
                                        marginRight: 12
                                    }}
                                />
                                <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
                                    Chi tiết đơn hàng ({cart.length} sản phẩm)
                                </Title>
                            </div>

                            <List
                                itemLayout="horizontal"
                                dataSource={cart}
                                renderItem={(item, index) => (
                                    <List.Item
                                        style={{
                                            padding: "16px 0",
                                            borderBottom: index === cart.length - 1 ? "none" : "1px solid #f0f0f0"
                                        }}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <div
                                                    style={{
                                                        width: 80,
                                                        height: 100,
                                                        borderRadius: 8,
                                                        overflow: "hidden",
                                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            item.book.coverImages?.[0] ||
                                                            "https://via.placeholder.com/300x400"
                                                        }
                                                        alt={item.book.title}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                </div>
                                            }
                                            title={
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 16,
                                                        color: "#1a1a1a",
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    {item.book.title}
                                                </Text>
                                            }
                                            description={
                                                <Space direction="vertical" size={4}>
                                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                                        Tác giả: {item.book.author}
                                                    </Text>
                                                    <div
                                                        style={{
                                                            background: "#e6f7ff",
                                                            padding: "4px 8px",
                                                            borderRadius: 6,
                                                            display: "inline-block",
                                                            border: "1px solid #bae7ff"
                                                        }}
                                                    >
                                                        <Text
                                                            style={{ fontSize: 13, fontWeight: 500, color: "#0958d9" }}
                                                        >
                                                            SL: {item.quantity}
                                                        </Text>
                                                    </div>
                                                </Space>
                                            }
                                        />
                                        <div style={{ textAlign: "right" }}>
                                            <Text
                                                type="secondary"
                                                style={{
                                                    display: "block",
                                                    fontSize: 13,
                                                    marginBottom: 4
                                                }}
                                            >
                                                {item.book.discountPrice &&
                                                item.book.discountPrice < item.book.originalPrice ? (
                                                    <>
                                                        <span
                                                            style={{ textDecoration: "line-through", marginRight: 6 }}
                                                        >
                                                            {new Intl.NumberFormat("vi-VN").format(
                                                                item.book.originalPrice
                                                            )}
                                                            ₫
                                                        </span>
                                                        <span style={{ color: "#ff4d4f" }}>
                                                            {new Intl.NumberFormat("vi-VN").format(
                                                                item.book.discountPrice
                                                            )}
                                                            ₫
                                                        </span>
                                                        {" × "}
                                                        {item.quantity}
                                                    </>
                                                ) : (
                                                    <>
                                                        {new Intl.NumberFormat("vi-VN").format(item.book.originalPrice)}
                                                        ₫ × {item.quantity}
                                                    </>
                                                )}
                                            </Text>

                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 16,
                                                    color: "#667eea",
                                                    fontWeight: 700
                                                }}
                                            >
                                                {new Intl.NumberFormat("vi-VN").format(
                                                    (item.book.discountPrice &&
                                                    item.book.discountPrice < item.book.originalPrice
                                                        ? item.book.discountPrice
                                                        : item.book.originalPrice) * item.quantity
                                                )}
                                                ₫
                                            </Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    {/* Right Column - Payment & Summary */}
                    <Col xs={24} lg={10}>
                        {/* Payment Method */}
                        <Card
                            style={{
                                marginBottom: 24,
                                borderRadius: 16,
                                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                                border: "none"
                            }}
                            bodyStyle={{ padding: 24 }}
                        >
                            <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                                <CreditCardOutlined
                                    style={{
                                        fontSize: 24,
                                        color: "#667eea",
                                        marginRight: 12
                                    }}
                                />
                                <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
                                    Phương thức thanh toán
                                </Title>
                            </div>

                            <Radio.Group
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                value={paymentMethod}
                                style={{ width: "100%" }}
                            >
                                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                    <Radio
                                        value="COD"
                                        style={{
                                            padding: "12px 16px",
                                            border: paymentMethod === "COD" ? "2px solid #667eea" : "1px solid #d9d9d9",
                                            borderRadius: 8,
                                            width: "100%",
                                            background: paymentMethod === "COD" ? "#f6f8ff" : "#ffffff",
                                            fontWeight: 500
                                        }}
                                    >
                                        💰 Thanh toán khi nhận hàng (COD)
                                    </Radio>
                                    <Radio
                                        value="PayPal"
                                        style={{
                                            padding: "12px 16px",
                                            border:
                                                paymentMethod === "PayPal" ? "2px solid #667eea" : "1px solid #d9d9d9",
                                            borderRadius: 8,
                                            width: "100%",
                                            background: paymentMethod === "PayPal" ? "#f6f8ff" : "#ffffff",
                                            fontWeight: 500
                                        }}
                                    >
                                        💳 Thanh toán qua PayPal
                                    </Radio>
                                    <Radio
                                        value="QR"
                                        style={{
                                            padding: "12px 16px",
                                            border: paymentMethod === "QR" ? "2px solid #667eea" : "1px solid #d9d9d9",
                                            borderRadius: 8,
                                            width: "100%",
                                            background: paymentMethod === "QR" ? "#f6f8ff" : "#ffffff",
                                            fontWeight: 500
                                        }}
                                    >
                                        📱 Thanh toán qua QR Code
                                    </Radio>
                                </Space>
                            </Radio.Group>

                            {/* QR Code Display */}
                            {paymentMethod === "QR" && (
                                <div style={{ marginTop: 16, textAlign: "center" }}>
                                    {processing ? (
                                        <div style={{ padding: 40 }}>
                                            <Text>Đang tạo mã QR...</Text>
                                        </div>
                                    ) : qrUrl ? (
                                        <div>
                                            <Text
                                                strong
                                                style={{ display: "block", marginBottom: 12, color: "#667eea" }}
                                            >
                                                <QrcodeOutlined style={{ marginRight: 8 }} />
                                                Quét mã để thanh toán
                                            </Text>
                                            <div
                                                style={{
                                                    padding: 16,
                                                    background: "#ffffff",
                                                    borderRadius: 12,
                                                    display: "inline-block",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                    border: "2px solid #f0f0f0"
                                                }}
                                            >
                                                <img
                                                    src={qrUrl}
                                                    alt="QR Code thanh toán"
                                                    style={{
                                                        width: 200,
                                                        height: 200,
                                                        display: "block"
                                                    }}
                                                />
                                            </div>
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 12, marginTop: 8, display: "block" }}
                                            >
                                                Sử dụng app ngân hàng để quét mã
                                            </Text>
                                        </div>
                                    ) : (
                                        <Text type="secondary">Không thể tạo mã QR</Text>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Order Summary */}
                        <Card
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                                border: "none",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            }}
                            bodyStyle={{ padding: 24 }}
                        >
                            <Title
                                level={4}
                                style={{
                                    color: "#ffffff",
                                    marginBottom: 20,
                                    textAlign: "center"
                                }}
                            >
                                Tổng thanh toán
                            </Title>

                            <div
                                style={{
                                    background: "rgba(255, 255, 255, 0.15)",
                                    borderRadius: 12,
                                    padding: 20,
                                    marginBottom: 20,
                                    backdropFilter: "blur(10px)"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>Tạm tính:</Text>
                                    <Text style={{ color: "#ffffff", fontSize: 15 }}>
                                        {new Intl.NumberFormat("vi-VN").format(totalPrice)}₫
                                    </Text>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>Phí vận chuyển:</Text>
                                    <Text style={{ color: "#ffffff", fontSize: 15 }}>Miễn phí</Text>
                                </div>
                                <Divider style={{ borderColor: "rgba(255, 255, 255, 0.3)", margin: "12px 0" }} />
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <Text strong style={{ color: "#ffffff", fontSize: 18 }}>
                                        Tổng cộng:
                                    </Text>
                                    <Text
                                        strong
                                        style={{
                                            color: "#ffffff",
                                            fontSize: 24,
                                            fontWeight: 700
                                        }}
                                    >
                                        {formatTotal()}
                                    </Text>
                                </div>
                            </div>

                            <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    loading={processing}
                                    onClick={handleConfirm}
                                    style={{
                                        width: "100%",
                                        height: 50,
                                        background: "#ffffff",
                                        border: "none",
                                        borderRadius: 12,
                                        fontWeight: 600,
                                        fontSize: 16,
                                        color: "#667eea",
                                        boxShadow: "0 4px 12px rgba(255, 255, 255, 0.3)"
                                    }}
                                    disabled={!phoneNumber.trim() || !address.trim() || !city.trim()}
                                >
                                    {processing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                                </Button>

                                <Button
                                    type="text"
                                    size="large"
                                    icon={<HomeOutlined />}
                                    onClick={() => navigate("/dashboard")}
                                    style={{
                                        width: "100%",
                                        height: 40,
                                        color: "rgba(255, 255, 255, 0.8)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                        borderRadius: 8,
                                        fontWeight: 500,
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    Quay lại trang chủ
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </div>
            <AppFooter />
        </>
    );
};

export default Checkout;
