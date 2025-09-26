import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Popconfirm,
    message,
    Tabs,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    Card,
    Typography,
    Space,
    Tag,
    Avatar,
    Row,
    Col,
    Statistic
} from "antd";
import {
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    StopOutlined,
    CrownOutlined,
    SafetyCertificateOutlined,
    ShoppingOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    MailOutlined
} from "@ant-design/icons";
import { UserDTO } from "../types/types";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState("all");
    const [filterRole, setFilterRole] = useState("all");
    const [messageApi, contextHolder] = message.useMessage();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/admin/users");
            setUsers(res.data.data || []);
        } catch (err) {
            messageApi.error("Lỗi khi tải danh sách người dùng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await axiosClient.delete(`/admin/users/${id}`);
            messageApi.success("Xóa người dùng thành công!");
            fetchUsers();
        } catch {
            messageApi.error("Xóa người dùng thất bại!");
        }
    };

    const openModal = (user?: UserDTO) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue(user);
        } else {
            setEditingUser(null);
            form.resetFields();
        }
        setVisible(true);
    };

    const handleSaveUser = async () => {
        try {
            const values = await form.validateFields();

            if (editingUser?.id && !values.password) {
                delete values.password;
            }

            if (editingUser?.id) {
                await axiosClient.put(`/users/${editingUser.id}`, values);
                messageApi.success("Cập nhật người dùng thành công!");
            } else {
                await axiosClient.post("/admin/users", values);
                messageApi.success("Thêm người dùng thành công!");
            }

            setVisible(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch {
            messageApi.error("Thao tác thất bại!");
        }
    };

    const filteredUsers = users.filter((user) => {
        if (activeTab === "active" && !user.active) return false;
        if (activeTab === "inactive" && user.active) return false;
        if (filterRole !== "all" && user.role !== filterRole) return false;
        return true;
    });

    // Tính toán thống kê
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.active).length;
    const inactiveUsers = users.filter((user) => !user.active).length;
    const adminUsers = users.filter((user) => user.role === "ADMIN").length;

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <CrownOutlined style={{ color: "#722ed1" }} />;
            case "STAFF":
                return <SafetyCertificateOutlined style={{ color: "#1890ff" }} />;
            case "CUSTOMER":
                return <ShoppingOutlined style={{ color: "#52c41a" }} />;
            default:
                return <UserOutlined />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "purple";
            case "STAFF":
                return "blue";
            case "CUSTOMER":
                return "green";
            default:
                return "default";
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "Quản trị";
            case "STAFF":
                return "Nhân viên";
            case "CUSTOMER":
                return "Khách hàng";
            default:
                return role;
        }
    };

    const columns = [
        {
            title: "Người dùng",
            key: "user",
            width: 250,
            render: (_: any, record: UserDTO) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: record.active ? "#1890ff" : "#d9d9d9",
                            color: "white"
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                            {record.firstName} {record.lastName}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MailOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.email}
                            </Text>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Liên hệ",
            key: "contact",
            width: 200,
            render: (_: any, record: UserDTO) => (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        <PhoneOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
                        <Text style={{ fontSize: 13 }}>{record.phoneNumber || "N/A"}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <EnvironmentOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.address || "N/A"}
                        </Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <EnvironmentOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.city || "N/A"}
                        </Text>
                    </div>
                </div>
            )
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            width: 120,
            render: (role: string) => (
                <Tag icon={getRoleIcon(role)} color={getRoleColor(role)} style={{ borderRadius: 6 }}>
                    {getRoleName(role)}
                </Tag>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "active",
            key: "active",
            width: 120,
            render: (active: boolean) => (
                <Tag
                    icon={active ? <CheckCircleOutlined /> : <StopOutlined />}
                    color={active ? "success" : "error"}
                    style={{ borderRadius: 6 }}
                >
                    {active ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            key: "actions",
            width: 120,
            render: (_: any, record: UserDTO) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                        style={{ color: "#1890ff" }}
                    />
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn có chắc muốn xóa người dùng này?"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "24px"
            }}
        >
            {contextHolder}
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            color: "#262626",
                            fontSize: 28,
                            fontWeight: 700
                        }}
                    >
                        Quản lý người dùng
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Quản lý tài khoản và phân quyền người dùng
                    </Text>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Tổng người dùng"
                                value={totalUsers}
                                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                                valueStyle={{ color: "#1890ff" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Đang hoạt động"
                                value={activeUsers}
                                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Ngừng hoạt động"
                                value={inactiveUsers}
                                prefix={<StopOutlined style={{ color: "#faad14" }} />}
                                valueStyle={{ color: "#faad14" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Quản trị viên"
                                value={adminUsers}
                                prefix={<CrownOutlined style={{ color: "#722ed1" }} />}
                                valueStyle={{ color: "#722ed1" }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Main Content Card */}
                <Card
                    style={{
                        borderRadius: 16,
                        border: "none",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
                    }}
                >
                    {/* Controls */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 24,
                            flexWrap: "wrap",
                            gap: 16
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                                <TabPane
                                    tab={
                                        <span>
                                            <TeamOutlined />
                                            Tất cả ({totalUsers})
                                        </span>
                                    }
                                    key="all"
                                />
                                <TabPane
                                    tab={
                                        <span>
                                            <CheckCircleOutlined />
                                            Hoạt động ({activeUsers})
                                        </span>
                                    }
                                    key="active"
                                />
                                <TabPane
                                    tab={
                                        <span>
                                            <StopOutlined />
                                            Ngừng hoạt động ({inactiveUsers})
                                        </span>
                                    }
                                    key="inactive"
                                />
                            </Tabs>
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <Select value={filterRole} onChange={setFilterRole} style={{ width: 160 }} size="large">
                                <Select.Option value="all">Tất cả vai trò</Select.Option>
                                <Select.Option value="ADMIN">Quản trị</Select.Option>
                                <Select.Option value="STAFF">Nhân viên</Select.Option>
                                <Select.Option value="CUSTOMER">Khách hàng</Select.Option>
                            </Select>

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openModal()}
                                style={{
                                    height: 40,
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                                }}
                            >
                                Thêm người dùng
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        rowKey="id"
                        dataSource={filteredUsers}
                        columns={columns}
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`
                        }}
                    />
                </Card>

                {/* Modal */}
                <Modal
                    title={
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#262626"
                            }}
                        >
                            {editingUser ? "Cập nhật người dùng" : "Thêm người dùng mới"}
                        </div>
                    }
                    open={visible}
                    onOk={handleSaveUser}
                    onCancel={() => {
                        setVisible(false);
                        form.resetFields();
                        setEditingUser(null);
                    }}
                    okText="Lưu"
                    cancelText="Hủy"
                    width={600}
                    style={{ top: 20 }}
                    okButtonProps={{
                        style: {
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            border: "none",
                            borderRadius: 6
                        }
                    }}
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="firstName"
                                    label="Tên"
                                    rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                                >
                                    <Input placeholder="Nhập tên" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="lastName"
                                    label="Họ"
                                    rules={[{ required: true, message: "Vui lòng nhập họ" }]}
                                >
                                    <Input placeholder="Nhập họ" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" }
                            ]}
                        >
                            <Input placeholder="Nhập địa chỉ email" />
                        </Form.Item>

                        {!editingUser && (
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                                    {
                                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message:
                                            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!"
                                    }
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>
                        )}

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="phoneNumber"
                                    label="Số điện thoại"
                                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="city"
                                    label="Thành phố"
                                    rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
                                >
                                    <Input placeholder="Nhập tên thành phố" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="role"
                                    label="Vai trò"
                                    initialValue="CUSTOMER"
                                    rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                                >
                                    <Select placeholder="Chọn vai trò">
                                        <Select.Option value="ADMIN">
                                            <Space>
                                                <CrownOutlined style={{ color: "#722ed1" }} />
                                                Quản trị viên
                                            </Space>
                                        </Select.Option>
                                        <Select.Option value="STAFF">
                                            <Space>
                                                <SafetyCertificateOutlined style={{ color: "#1890ff" }} />
                                                Nhân viên
                                            </Space>
                                        </Select.Option>
                                        <Select.Option value="CUSTOMER">
                                            <Space>
                                                <ShoppingOutlined style={{ color: "#52c41a" }} />
                                                Khách hàng
                                            </Space>
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="active" label="Trạng thái" valuePropName="checked" initialValue={true}>
                                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng hoạt động" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default AdminUsers;
