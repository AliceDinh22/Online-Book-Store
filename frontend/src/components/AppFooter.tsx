import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Typography, Space, Button, Divider } from "antd";
import { BookOutlined, CopyrightOutlined, HeartOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Footer } = Layout;
const { Title, Text } = Typography;

const AppFooter: React.FC = () => {
    const [storeInfo, setStoreInfo] = useState<any>(null);

    const getLatestStoreInfo = async () => {
        try {
            const response = await axiosClient.get("/auth/store/latest"); 
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin cửa hàng mới nhất:", error);
            return null;
        }
    };

    useEffect(() => {
        getLatestStoreInfo().then((data) => setStoreInfo(data));
    }, []);

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return "";
        const cleaned = phone.replace(/\D/g, ""); // loại bỏ ký tự không phải số
        if (cleaned.startsWith("0")) {
            const number = cleaned.slice(1); 
            if (number.length === 9) return `(+84) ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
            if (number.length === 8) return `(+84) ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
        }
        return phone;
    };

    return (
        <Footer style={{ background: "#001529", color: "white", textAlign: "center", marginTop: 48 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3px 0 30px 0" }}>
                <Row gutter={[48, 24]}>
                    <Col xs={24} md={8}>
                        <Title level={4} style={{ color: "white", marginBottom: 16 }}>
                            <BookOutlined /> {storeInfo?.name || "BookStore"}
                        </Title>
                        <Text style={{ color: "#bfbfbf", display: "block", lineHeight: 1.6 }}>
                            {storeInfo?.description ||
                                "Cửa hàng sách trực tuyến uy tín với hàng ngàn đầu sách chất lượng."}
                        </Text>
                    </Col>
                    <Col xs={24} md={8}>
                        <Title level={5} style={{ color: "white", marginBottom: 16 }}>
                            Liên hệ
                        </Title>
                        <Text style={{ color: "#bfbfbf", display: "block", marginBottom: 8 }}>
                            📧 {storeInfo?.email || "contact@bookstore.com"}
                        </Text>
                        <Text style={{ color: "#bfbfbf", display: "block", marginBottom: 8 }}>
                            📞 {storeInfo?.phone ? formatPhoneNumber(storeInfo.phone) : "(+84) 123 456 789"}
                        </Text>

                        <Text style={{ color: "#bfbfbf", display: "block" }}>
                            📍 {storeInfo?.address}, {storeInfo?.city}, {storeInfo?.country}
                        </Text>
                    </Col>
                    <Col xs={24} md={8}>
                        <Title level={5} style={{ color: "white", marginBottom: 16 }}>
                            Theo dõi chúng tôi
                        </Title>
                        <Space size={16}>
                            <Button
                                shape="circle"
                                style={{ background: "transparent", border: "1px solid #bfbfbf", color: "#bfbfbf" }}
                            >
                                f
                            </Button>
                            <Button
                                shape="circle"
                                style={{ background: "transparent", border: "1px solid #bfbfbf", color: "#bfbfbf" }}
                            >
                                t
                            </Button>
                            <Button
                                shape="circle"
                                style={{ background: "transparent", border: "1px solid #bfbfbf", color: "#bfbfbf" }}
                            >
                                i
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider style={{ borderColor: "#434343", margin: "32px 0 16px 0" }} />
                <Text style={{ color: "#8c8c8c" }}>
                    <CopyrightOutlined /> 2025 {storeInfo?.name || "BookStore"}. Made with{" "}
                    <HeartOutlined style={{ color: "#ff4d4f" }} /> in Vietnam
                </Text>
            </div>
        </Footer>
    );
};

export default AppFooter;
