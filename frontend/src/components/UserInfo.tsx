import React, { useState, useEffect } from "react";
import { Button, Form, Input, Card, message, Row, Col, Typography, Tag } from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { UserDTO } from "../types/types";
import axiosClient from "../api/axiosClient";

const { Text } = Typography;

const roleLabels: Record<string, string> = {
    ADMIN: "Quản trị viên",
    STAFF: "Nhân viên", 
    CUSTOMER: "Khách hàng"
};

const roleColors: Record<string, string> = {
    ADMIN: "purple",
    STAFF: "blue",
    CUSTOMER: "green"
};

const UserInfo: React.FC = () => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            form.setFieldsValue(u);
        }
    }, [form]);

    const handleEdit = () => {
        if (user) form.setFieldsValue(user);
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        if (user) form.setFieldsValue(user);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            if (!user) return;

            await axiosClient.put(`/users/${user.id}`, values);

            const updatedUser = { ...user, ...values };
            setUser(updatedUser);
            sessionStorage.setItem("user", JSON.stringify(updatedUser));

            messageApi.success("Cập nhật thông tin thành công!");
            setEditing(false);
        } catch (error: any) {
            messageApi.error(error.response?.data?.message || "Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ textAlign: "center", padding: 40 }}>Đang tải thông tin...</div>;

    return (
        <div style={{ marginTop: 16 }}>
            {contextHolder}
            {!editing ? (
                <Card 
                    style={{ border: "none", boxShadow: "none" }}
                    bodyStyle={{ padding: 0 }}
                >
                    <Row gutter={[24, 16]}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                    Họ
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>{user.lastName}</Text>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                    Tên
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>{user.firstName}</Text>
                            </div>
                        </Col>
                        <Col span={24}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                    Email
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>{user.email}</Text>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                    Số điện thoại
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>{user.phoneNumber || "Chưa cập nhật"}</Text>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                    Thành phố
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>{user.city || "Chưa cập nhật"}</Text>
                            </div>
                        </Col>
                        <Col span={24}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                    Địa chỉ
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>{user.address || "Chưa cập nhật"}</Text>
                            </div>
                        </Col>
                        <Col span={24}>
                            <div style={{ marginBottom: 24 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                                    Vai trò
                                </Text>
                                <Tag color={roleColors[user.role]} style={{ fontSize: 14, padding: "4px 12px" }}>
                                    {roleLabels[user.role] || user.role}
                                </Tag>
                            </div>
                        </Col>
                    </Row>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={handleEdit}
                        style={{
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 500
                        }}
                    >
                        Chỉnh sửa thông tin
                    </Button>
                </Card>
            ) : (
                <Form layout="vertical" form={form}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Họ"
                                name="lastName"
                                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
                            >
                                <Input placeholder="Nhập họ" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tên"
                                name="firstName"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                            >
                                <Input placeholder="Nhập tên" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không hợp lệ" }
                        ]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phoneNumber"
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Thành phố"
                                name="city"
                                rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
                            >
                                <Input placeholder="Nhập thành phố" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                    
                    <Form.Item label="Vai trò">
                        <Input value={roleLabels[user.role] || user.role} disabled />
                    </Form.Item>
                    
                    <div style={{ display: "flex", gap: 12 }}>
                        <Button 
                            type="primary" 
                            icon={<SaveOutlined />}
                            onClick={handleSave} 
                            loading={loading}
                            style={{
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none",
                                borderRadius: 8,
                                fontWeight: 500
                            }}
                        >
                            Lưu thay đổi
                        </Button>
                        <Button 
                            icon={<CloseOutlined />}
                            onClick={handleCancel}
                            style={{
                                borderRadius: 8,
                                fontWeight: 500
                            }}
                        >
                            Hủy
                        </Button>
                    </div>
                </Form>
            )}
        </div>
    );
};

export default UserInfo;
