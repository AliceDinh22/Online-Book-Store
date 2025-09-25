import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Button, Input, Form, message, List, Space, Row, Col, Avatar } from "antd";
import {
    ShopOutlined,
    EditOutlined,
    SaveOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text, Paragraph } = Typography;

const AdminStoreInfo = () => {
    const [storeInfos, setStoreInfos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const [form] = Form.useForm();

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return "";
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.startsWith("0")) {
            const number = cleaned.slice(1);
            if (number.length === 9) return `(+84) ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
            if (number.length === 8) return `(+84) ${number.slice(0, 1)} ${number.slice(1, 4)} ${number.slice(4)}`;
        }
        return phone;
    };

    const fetchStoreInfos = () => {
        setLoading(true);
        axiosClient
            .get("/admin/store")
            .then((res) => {
                if (Array.isArray(res.data.data)) {
                    setStoreInfos(res.data.data);
                } else if (res.data) {
                    setStoreInfos([res.data.data]);
                } else {
                    setStoreInfos([]);
                }
            })
            .catch(() => message.error("Lấy thông tin cửa hàng thất bại"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStoreInfos();
    }, []);

    const handleEdit = (info: any) => {
        setEditing(info);
        form.setFieldsValue(info);
    };

    const handleCancel = () => {
        setEditing(null);
        form.resetFields();
    };

    const handleSave = (values: any) => {
        setSaving(true);
        axiosClient
            .post("/admin/store", { ...editing, ...values })
            .then((res) => {
                message.success("Lưu thông tin cửa hàng thành công!");
                setEditing(null);
                fetchStoreInfos();
                form.resetFields();
            })
            .catch(() => message.error("Có lỗi xảy ra khi lưu thông tin."))
            .finally(() => setSaving(false));
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <Card
                style={{
                    marginBottom: 24,
                    borderRadius: 16,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                    border: "none",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                }}
                bodyStyle={{ padding: 32 }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Avatar
                        size={64}
                        icon={<ShopOutlined />}
                        style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                            color: "#ffffff",
                            fontSize: 28
                        }}
                    />
                    <div>
                        <Title
                            level={2}
                            style={{
                                color: "#ffffff",
                                margin: 0,
                                fontSize: 32,
                                fontWeight: 700
                            }}
                        >
                            Thông tin cửa hàng
                        </Title>
                        <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
                            Quản lý thông tin và cấu hình cửa hàng
                        </Text>
                    </div>
                </div>
            </Card>

            {/* Edit Form */}
            {editing && (
                <Card
                    style={{
                        marginBottom: 24,
                        borderRadius: 16,
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                        border: "2px solid #667eea"
                    }}
                    bodyStyle={{ padding: 32 }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                        <EditOutlined style={{ fontSize: 24, color: "#667eea" }} />
                        <Title level={3} style={{ margin: 0, color: "#1a1a1a" }}>
                            Chỉnh sửa thông tin cửa hàng
                        </Title>
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleSave} size="large">
                        <Row gutter={[24, 16]}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Tên cửa hàng"
                                    name="name"
                                    rules={[{ required: true, message: "Vui lòng nhập tên cửa hàng" }]}
                                >
                                    <Input
                                        prefix={<ShopOutlined style={{ color: "#667eea" }} />}
                                        placeholder="Nhập tên cửa hàng"
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ type: "email", message: "Email không hợp lệ" }]}
                                >
                                    <Input
                                        prefix={<MailOutlined style={{ color: "#667eea" }} />}
                                        placeholder="email@example.com"
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item label="Số điện thoại" name="phone">
                                    <Input
                                        prefix={<PhoneOutlined style={{ color: "#667eea" }} />}
                                        placeholder="0123456789"
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item label="Quốc gia" name="country">
                                    <Input
                                        prefix={<GlobalOutlined style={{ color: "#667eea" }} />}
                                        placeholder="Việt Nam"
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item label="Địa chỉ" name="address">
                                    <Input
                                        prefix={<EnvironmentOutlined style={{ color: "#667eea" }} />}
                                        placeholder="Nhập địa chỉ"
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item label="Thành phố" name="city">
                                    <Input
                                        prefix={<EnvironmentOutlined style={{ color: "#667eea" }} />}
                                        placeholder="TP. Hồ Chí Minh"
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24}>
                                <Form.Item label="Mô tả cửa hàng" name="description">
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="Mô tả về cửa hàng của bạn..."
                                        style={{ borderRadius: 8 }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div style={{ textAlign: "right", marginTop: 24 }}>
                            <Space size={12}>
                                <Button
                                    size="large"
                                    onClick={handleCancel}
                                    style={{
                                        borderRadius: 8,
                                        fontWeight: 500
                                    }}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={saving}
                                    size="large"
                                    icon={<SaveOutlined />}
                                    style={{
                                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                                        border: "none",
                                        borderRadius: 8,
                                        fontWeight: 500,
                                        padding: "0 32px"
                                    }}
                                >
                                    Lưu thay đổi
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </Card>
            )}

            {/* Store Info List */}
            <Card
                style={{
                    borderRadius: 16,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                    border: "none"
                }}
                bodyStyle={{ padding: 0 }}
            >
                {storeInfos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <InfoCircleOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Chưa có thông tin cửa hàng nào
                        </Text>

                        <div style={{ marginTop: 24 }}>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit({})} 
                                style={{
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    border: "none",
                                    borderRadius: 8,
                                    fontWeight: 500
                                }}
                            >
                                Thêm thông tin cửa hàng
                            </Button>
                        </div>
                    </div>
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={storeInfos}
                        renderItem={(item, index) => (
                            <List.Item
                                style={{
                                    padding: 32,
                                    borderBottom: index === storeInfos.length - 1 ? "none" : "1px solid #f0f0f0"
                                }}
                                actions={[
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(item)}
                                        style={{
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            border: "none",
                                            borderRadius: 8,
                                            fontWeight: 500
                                        }}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                ]}
                            >
                                <Row gutter={[24, 16]}>
                                    {/* Store Name */}
                                    <Col xs={24}>
                                        <div
                                            style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}
                                        >
                                            <Avatar
                                                size={48}
                                                icon={<ShopOutlined />}
                                                style={{
                                                    background: "linear-gradient(135deg, #667eea, #764ba2)"
                                                }}
                                            />
                                            <div>
                                                <Title level={3} style={{ margin: 0, color: "#1a1a1a" }}>
                                                    {item.name || "Chưa có tên"}
                                                </Title>
                                                <Text type="secondary" style={{ fontSize: 14 }}>
                                                    Thông tin cửa hàng #{index + 1}
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Contact Info */}
                                    <Col xs={24} sm={12}>
                                        <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                            <div>
                                                <Text
                                                    strong
                                                    style={{ color: "#4a5568", display: "block", marginBottom: 4 }}
                                                >
                                                    <MailOutlined style={{ marginRight: 8, color: "#667eea" }} />
                                                    Email
                                                </Text>
                                                <Text
                                                    style={{ fontSize: 15, color: item.email ? "#1a1a1a" : "#bfbfbf" }}
                                                >
                                                    {item.email || "Chưa cập nhật"}
                                                </Text>
                                            </div>

                                            <div>
                                                <Text
                                                    strong
                                                    style={{ color: "#4a5568", display: "block", marginBottom: 4 }}
                                                >
                                                    <PhoneOutlined style={{ marginRight: 8, color: "#667eea" }} />
                                                    Số điện thoại
                                                </Text>
                                                <Text
                                                    style={{ fontSize: 15, color: item.phone ? "#1a1a1a" : "#bfbfbf" }}
                                                >
                                                    {item.phone ? formatPhoneNumber(item.phone) : "Chưa cập nhật"}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>

                                    {/* Location Info */}
                                    <Col xs={24} sm={12}>
                                        <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                            <div>
                                                <Text
                                                    strong
                                                    style={{ color: "#4a5568", display: "block", marginBottom: 4 }}
                                                >
                                                    <EnvironmentOutlined style={{ marginRight: 8, color: "#667eea" }} />
                                                    Địa chỉ
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: 15,
                                                        color: item.address ? "#1a1a1a" : "#bfbfbf"
                                                    }}
                                                >
                                                    {item.address
                                                        ? `${item.address}, ${item.city || ""}, ${
                                                              item.country || ""
                                                          }`.replace(/^,\s*|,\s*$/g, "")
                                                        : "Chưa cập nhật"}
                                                </Text>
                                            </div>

                                            <div>
                                                <Text
                                                    strong
                                                    style={{ color: "#4a5568", display: "block", marginBottom: 4 }}
                                                >
                                                    <GlobalOutlined style={{ marginRight: 8, color: "#667eea" }} />
                                                    Quốc gia
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: 15,
                                                        color: item.country ? "#1a1a1a" : "#bfbfbf"
                                                    }}
                                                >
                                                    {item.country || "Chưa cập nhật"}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>

                                    {/* Description */}
                                    {item.description && (
                                        <Col xs={24}>
                                            <div style={{ marginTop: 16 }}>
                                                <Text
                                                    strong
                                                    style={{ color: "#4a5568", display: "block", marginBottom: 8 }}
                                                >
                                                    <InfoCircleOutlined style={{ marginRight: 8, color: "#667eea" }} />
                                                    Mô tả
                                                </Text>
                                                <div
                                                    style={{
                                                        background: "#f8f9fa",
                                                        padding: 16,
                                                        borderRadius: 8,
                                                        border: "1px solid #e9ecef"
                                                    }}
                                                >
                                                    <Paragraph style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
                                                        {item.description}
                                                    </Paragraph>
                                                </div>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default AdminStoreInfo;
