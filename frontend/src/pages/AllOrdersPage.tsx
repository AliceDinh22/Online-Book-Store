import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    Card,
    Typography,
    Spin,
    Modal,
    Button,
    message,
    Form,
    Input,
    Select,
    Tag,
    Space,
    Row,
    Col,
    Avatar,
    Empty,
    Statistic,
    DatePicker
} from "antd";
import {
    ShoppingOutlined,
    CalendarOutlined,
    DollarCircleOutlined,
    EyeOutlined,
    EditOutlined,
    SaveOutlined,
    UserOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    BookOutlined,
    CreditCardOutlined,
    FilterOutlined,
    SearchOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getAllOrders, getOrderItems, updateOrder } from "../api/orderApi";
import { OrderDTO, OrderItemDTO } from "../types/types";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const orderStatusMap: Record<string, { text: string; color: string }> = {
    PENDING: { text: "Chờ xử lý", color: "orange" },
    PROCESSING: { text: "Đang xử lý", color: "blue" },
    SHIPPED: { text: "Đã gửi hàng", color: "cyan" },
    DELIVERED: { text: "Đã giao hàng", color: "green" },
    CANCELED: { text: "Đã hủy", color: "red" },
    FAILED: { text: "Thất bại", color: "red" },
    REFUNDED: { text: "Đã hoàn tiền", color: "purple" }
};

const paymentStatusMap: Record<string, { text: string; color: string }> = {
    PENDING: { text: "Đang chờ", color: "orange" },
    COMPLETED: { text: "Hoàn thành", color: "green" },
    FAILED: { text: "Thất bại", color: "red" },
    REFUNDED: { text: "Đã hoàn tiền", color: "cyan" }
};

const renderStatusTag = (status: string, map: Record<string, { text: string; color: string }>) => {
    const { text, color } = map[status] || { text: status, color: "default" };
    return (
        <Tag color={color} style={{ fontWeight: 500 }}>
            {text}
        </Tag>
    );
};

const formatCurrency = (amount: number, method: string): string => {
    if (method?.toLowerCase() === "paypal") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    } else {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);
    }
};

const usdToVndRate = 25000;

const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};

dayjs.extend(isBetween);

const AllOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItemDTO[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [updating, setUpdating] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    // Filter states
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
    const [userFilter, setUserFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    // Get unique users from orders
    const uniqueUsers = useMemo(() => {
        const users: string[] = orders.map((order) => order.username).filter(Boolean) as string[];
        return Array.from(new Set(users)).sort();
    }, [orders]);

    // Filter orders based on filters
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Date range filter
            if (dateRange[0] && dateRange[1]) {
                const orderDate = dayjs(order.date);
                if (!orderDate.isBetween(dateRange[0], dateRange[1], "day", "[]")) {
                    return false;
                }
            }

            // User filter
            if (userFilter && !order.username?.toLowerCase().includes(userFilter.toLowerCase())) {
                return false;
            }

            // Status filter
            if (statusFilter && order.status !== statusFilter) {
                return false;
            }

            return true;
        });
    }, [orders, dateRange, userFilter, statusFilter]);

    // Calculate statistics for filtered orders
    const statistics = useMemo(() => {
        const totalOrders = filteredOrders.length;

        const processingOrders = filteredOrders.filter(
            (o) => o.status === "PENDING" || o.status === "PROCESSING"
        ).length;

        const deliveredOrders = filteredOrders.filter((o) => o.status === "DELIVERED").length;

        const totalRevenue = filteredOrders
            .filter((o) => o.status === "DELIVERED")
            .reduce((sum, o) => {
                if (o.payment?.method?.toLowerCase() === "paypal") {
                    return sum + o.totalPrice * usdToVndRate;
                }
                return sum + o.totalPrice;
            }, 0);

        return {
            totalOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue
        };
    }, [filteredOrders]);

    const clearFilters = () => {
        setDateRange([null, null]);
        setUserFilter("");
        setStatusFilter("");
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = () => {
        setLoading(true);
        getAllOrders()
            .then((data) => setOrders(data))
            .catch(() => messageApi.error("Không thể tải danh sách đơn hàng!"))
            .finally(() => setLoading(false));
    };

    const showOrderDetails = (order: OrderDTO) => {
        if (!order.id) return;

        setSelectedOrder(order);
        setModalVisible(true);
        setModalLoading(true);
        setIsEditing(false);

        getOrderItems(order.id)
            .then((items) => {
                const itemsWithPayment = items.map((item) => ({
                    ...item,
                    paymentDTO: order.payment
                }));
                setSelectedOrderItems(itemsWithPayment);
                form.setFieldsValue(order);
            })
            .catch(() => messageApi.error("Không thể tải chi tiết đơn hàng!"))
            .finally(() => setModalLoading(false));
    };

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const values = await form.validateFields();
            if (!selectedOrder) return;

            await updateOrder({ ...selectedOrder, ...values }, selectedOrder.id!);
            messageApi.success("Cập nhật đơn hàng thành công!");
            setIsEditing(false);
            setModalVisible(false);
            loadOrders();
        } catch (err) {
            messageApi.error("Cập nhật đơn hàng thất bại!");
        } finally {
            setUpdating(false);
        }
    };

    const columnsOrders = [
        {
            title: "Mã đơn hàng",
            dataIndex: "id",
            key: "id",
            render: (id: number) => (
                <Text strong style={{ color: "#667eea" }}>
                    #{id.toString().padStart(6, "0")}
                </Text>
            )
        },
        {
            title: "Ngày đặt",
            dataIndex: "date",
            key: "date",
            render: (date: string) => (
                <Space>
                    <CalendarOutlined style={{ color: "#667eea" }} />
                    <Text>{formatDate(date)}</Text>
                </Space>
            )
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (_: any, record: OrderDTO) => (
                <Space>
                    <DollarCircleOutlined style={{ color: "#52c41a" }} />
                    <Text strong style={{ color: "#52c41a", fontSize: 15 }}>
                        {record.payment
                            ? formatCurrency(record.totalPrice, record.payment.method)
                            : `${record.totalPrice.toLocaleString()}₫`}
                    </Text>
                </Space>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => renderStatusTag(status, orderStatusMap)
        },
        {
            title: "Khách hàng",
            dataIndex: "username",
            key: "username",
            render: (username: string) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} style={{ background: "#1890ff" }} />
                    <Text>{username || "N/A"}</Text>
                </Space>
            )
        },
        {
            title: "Địa chỉ giao hàng",
            key: "address",
            render: (_: any, record: OrderDTO) => (
                <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: `${record.address}, ${record.city}` }}>
                    {`${record.address}, ${record.city}`}
                </Text>
            )
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: OrderDTO) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => showOrderDetails(record)}
                    style={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 500
                    }}
                >
                    Chi tiết
                </Button>
            )
        }
    ];

    const columnsItems = [
        {
            title: "Hình ảnh",
            dataIndex: "bookUrl",
            key: "bookUrl",
            render: (urls: string[] | string) => {
                let url = "";
                if (Array.isArray(urls)) {
                    url = urls[0] || "";
                } else {
                    url = (urls || "").replace(/[\[\]]/g, "");
                }
                return (
                    <div
                        style={{
                            width: 60,
                            height: 80,
                            borderRadius: 8,
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                        }}
                    >
                        <img
                            src={url || "https://via.placeholder.com/300x400"}
                            alt="book"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                        />
                    </div>
                );
            }
        },
        {
            title: "Sản phẩm",
            dataIndex: "bookTitle",
            key: "bookTitle",
            render: (title: string) => (
                <Space>
                    <Avatar size="small" icon={<BookOutlined />} style={{ background: "#667eea" }} />
                    <Text strong>{title}</Text>
                </Space>
            )
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity: number) => (
                <Tag color="blue" style={{ fontWeight: 500 }}>
                    x{quantity}
                </Tag>
            )
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            render: (price: number, record: OrderItemDTO) => {
                let displayAmount = price;

                if (record.paymentDTO?.method.toLowerCase() === "paypal") {
                    displayAmount = price / usdToVndRate;
                }

                return (
                    <Text strong style={{ color: "#667eea" }}>
                        {record.paymentDTO
                            ? formatCurrency(displayAmount, record.paymentDTO.method)
                            : `${price.toLocaleString()}₫`}
                    </Text>
                );
            }
        }
    ];

    if (loading) {
        return (
            <>
                {contextHolder}
                <AppHeader />
                <div
                    style={{
                        minHeight: "calc(100vh - 140px)",
                        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <Spin size="large" />
                </div>
                <AppFooter />
            </>
        );
    }

    return (
        <>
            {contextHolder}
            <AppHeader />
            <div
                style={{
                    minHeight: "calc(100vh - 140px)",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    padding: "32px 24px"
                }}
            >
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
                                icon={<ShoppingOutlined />}
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
                                    Quản lý đơn hàng
                                </Title>
                                <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
                                    Theo dõi và quản lý tất cả đơn hàng trong hệ thống
                                </Text>
                            </div>
                        </div>
                    </Card>

                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={12} sm={8} md={6}>
                            <Card
                                style={{
                                    borderRadius: 12,
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <Statistic
                                    title="Tổng đơn hàng"
                                    value={statistics.totalOrders}
                                    prefix={<ShoppingOutlined style={{ color: "#1890ff" }} />}
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Card
                                style={{
                                    borderRadius: 12,
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <Statistic
                                    title="Đang xử lý"
                                    value={statistics.processingOrders}
                                    prefix={<CalendarOutlined style={{ color: "#faad14" }} />}
                                    valueStyle={{ color: "#faad14" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Card
                                style={{
                                    borderRadius: 12,
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <Statistic
                                    title="Đã hoàn thành"
                                    value={statistics.deliveredOrders}
                                    prefix={<DollarCircleOutlined style={{ color: "#52c41a" }} />}
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Card
                                style={{
                                    borderRadius: 12,
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <Statistic
                                    title="Tổng doanh thu"
                                    value={statistics.totalRevenue}
                                    prefix={<DollarCircleOutlined style={{ color: "#722ed1" }} />}
                                    valueStyle={{ color: "#722ed1", fontSize: 16 }}
                                    formatter={(value) => `${Number(value).toLocaleString()}₫`}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Filter Section */}
                    <Card
                        style={{
                            marginBottom: 24,
                            borderRadius: 12,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                        }}
                        bodyStyle={{ padding: 20 }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <FilterOutlined style={{ fontSize: 18, color: "#667eea" }} />
                            <Title level={5} style={{ margin: 0, color: "#1a1a1a" }}>
                                Bộ lọc đơn hàng
                            </Title>
                        </div>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <div>
                                    <Text strong style={{ display: "block", marginBottom: 8, color: "#4a5568" }}>
                                        Khoảng thời gian
                                    </Text>
                                    <RangePicker
                                        style={{ width: "100%", borderRadius: 6 }}
                                        value={dateRange}
                                        onChange={(dates) =>
                                            setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
                                        }
                                        format="DD/MM/YYYY"
                                        placeholder={["Từ ngày", "Đến ngày"]}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div>
                                    <Text strong style={{ display: "block", marginBottom: 8, color: "#4a5568" }}>
                                        Khách hàng
                                    </Text>
                                    <Input
                                        style={{ borderRadius: 6 }}
                                        prefix={<SearchOutlined style={{ color: "#667eea" }} />}
                                        placeholder="Tìm theo tên khách hàng"
                                        value={userFilter}
                                        onChange={(e) => setUserFilter(e.target.value)}
                                        allowClear
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <div>
                                    <Text strong style={{ display: "block", marginBottom: 8, color: "#4a5568" }}>
                                        Trạng thái
                                    </Text>
                                    <Select
                                        style={{ width: "100%", borderRadius: 6 }}
                                        placeholder="Chọn trạng thái"
                                        value={statusFilter || undefined}
                                        onChange={setStatusFilter}
                                        allowClear
                                    >
                                        {Object.keys(orderStatusMap).map((key) => (
                                            <Option key={key} value={key}>
                                                <Tag color={orderStatusMap[key].color} style={{ marginRight: 8 }}>
                                                    {orderStatusMap[key].text}
                                                </Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <div>
                                    <Text strong style={{ display: "block", marginBottom: 8, color: "transparent" }}>
                                        Action
                                    </Text>
                                    <Button
                                        style={{
                                            width: "100%",
                                            borderRadius: 6,
                                            fontWeight: 500
                                        }}
                                        onClick={clearFilters}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        {/* Filter Summary */}
                        {(dateRange[0] && dateRange[1]) || userFilter || statusFilter ? (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 16,
                                    background: "#f0f9ff",
                                    borderRadius: 8,
                                    border: "1px solid #bae7ff"
                                }}
                            >
                                <Text strong style={{ color: "#1890ff", marginRight: 8 }}>
                                    Đang lọc:
                                </Text>
                                {dateRange[0] && dateRange[1] && (
                                    <Tag color="blue" style={{ marginRight: 8 }}>
                                        📅 {dateRange[0].format("DD/MM/YYYY")} - {dateRange[1].format("DD/MM/YYYY")}
                                    </Tag>
                                )}
                                {userFilter && (
                                    <Tag color="green" style={{ marginRight: 8 }}>
                                        👤 {userFilter}
                                    </Tag>
                                )}
                                {statusFilter && (
                                    <Tag
                                        color={orderStatusMap[statusFilter]?.color || "default"}
                                        style={{ marginRight: 8 }}
                                    >
                                        📊 {orderStatusMap[statusFilter]?.text || statusFilter}
                                    </Tag>
                                )}
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    Tìm thấy {statistics.totalOrders} đơn hàng • Doanh thu:{" "}
                                    {statistics.totalRevenue.toLocaleString()}₫
                                </Text>
                            </div>
                        ) : null}
                    </Card>

                    {/* Orders Table */}
                    <Card
                        style={{
                            borderRadius: 16,
                            border: "none",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        {filteredOrders.length === 0 ? (
                            <Empty
                                description={
                                    (dateRange[0] && dateRange[1]) || userFilter || statusFilter
                                        ? "Không tìm thấy đơn hàng nào với bộ lọc này"
                                        : "Chưa có đơn hàng nào trong hệ thống"
                                }
                                style={{ padding: 48 }}
                            />
                        ) : (
                            <Table
                                dataSource={filteredOrders}
                                columns={columnsOrders}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
                                }}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: 12
                                }}
                            />
                        )}
                    </Card>
                </div>
            </div>

            {/* Order Details Modal */}
            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar size={32} icon={<ShoppingOutlined />} style={{ background: "#667eea" }} />
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                Chi tiết đơn hàng #{selectedOrder?.id?.toString().padStart(6, "0")}
                            </Title>
                        </div>
                    </div>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                }}
                footer={
                    isEditing
                        ? [
                              <Button
                                  key="cancel"
                                  onClick={() => setIsEditing(false)}
                                  style={{ borderRadius: 6, fontWeight: 500 }}
                              >
                                  Hủy bỏ
                              </Button>,
                              <Button
                                  key="save"
                                  type="primary"
                                  loading={updating}
                                  icon={<SaveOutlined />}
                                  onClick={handleUpdate}
                                  style={{
                                      background: "linear-gradient(135deg, #52c41a, #73d13d)",
                                      border: "none",
                                      borderRadius: 6,
                                      fontWeight: 500
                                  }}
                              >
                                  Lưu thay đổi
                              </Button>
                          ]
                        : [
                              <Button
                                  key="close"
                                  onClick={() => setModalVisible(false)}
                                  style={{ borderRadius: 6, fontWeight: 500 }}
                              >
                                  Đóng
                              </Button>,
                              <Button
                                  key="edit"
                                  type="primary"
                                  icon={<EditOutlined />}
                                  onClick={() => setIsEditing(true)}
                                  style={{
                                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                                      border: "none",
                                      borderRadius: 6,
                                      fontWeight: 500
                                  }}
                              >
                                  Chỉnh sửa
                              </Button>
                          ]
                }
                width={900}
                style={{ top: 20 }}
            >
                {modalLoading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>
                            <Text>Đang tải chi tiết đơn hàng...</Text>
                        </div>
                    </div>
                ) : isEditing ? (
                    <Card
                        style={{
                            borderRadius: 12,
                            border: "2px solid #667eea"
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Title level={5} style={{ marginBottom: 20, color: "#1a1a1a" }}>
                            Chỉnh sửa thông tin đơn hàng
                        </Title>
                        <Form form={form} layout="vertical" size="large">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="status"
                                        label={<Text strong>Trạng thái đơn hàng</Text>}
                                        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                                    >
                                        <Select style={{ borderRadius: 6 }}>
                                            {Object.keys(orderStatusMap).map((key) => (
                                                <Option key={key} value={key}>
                                                    <Tag color={orderStatusMap[key].color} style={{ marginRight: 8 }}>
                                                        {orderStatusMap[key].text}
                                                    </Tag>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label={
                                            <Space>
                                                <PhoneOutlined style={{ color: "#667eea" }} />
                                                <Text strong>Số điện thoại</Text>
                                            </Space>
                                        }
                                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                                    >
                                        <Input style={{ borderRadius: 6 }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="address"
                                        label={
                                            <Space>
                                                <EnvironmentOutlined style={{ color: "#667eea" }} />
                                                <Text strong>Địa chỉ</Text>
                                            </Space>
                                        }
                                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                                    >
                                        <Input style={{ borderRadius: 6 }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="city"
                                        label={
                                            <Space>
                                                <EnvironmentOutlined style={{ color: "#667eea" }} />
                                                <Text strong>Thành phố</Text>
                                            </Space>
                                        }
                                        rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
                                    >
                                        <Input style={{ borderRadius: 6 }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                ) : (
                    <div>
                        {/* Customer & Shipping Info */}
                        {selectedOrder && (
                            <Card
                                style={{
                                    marginBottom: 24,
                                    borderRadius: 12,
                                    border: "1px solid #f0f0f0"
                                }}
                                bodyStyle={{ padding: 20 }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                    <Avatar size={32} icon={<UserOutlined />} style={{ background: "#1890ff" }} />
                                    <Title level={5} style={{ margin: 0, color: "#1a1a1a" }}>
                                        Thông tin giao hàng
                                    </Title>
                                </div>
                                <Row gutter={[16, 12]}>
                                    <Col span={12}>
                                        <Text strong style={{ color: "#4a5568", display: "block" }}>
                                            Khách hàng:
                                        </Text>
                                        <Text style={{ fontSize: 15 }}>{selectedOrder.username || "N/A"}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong style={{ color: "#4a5568", display: "block" }}>
                                            Số điện thoại:
                                        </Text>
                                        <Text style={{ fontSize: 15 }}>{selectedOrder.phoneNumber}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong style={{ color: "#4a5568", display: "block" }}>
                                            Địa chỉ:
                                        </Text>
                                        <Text style={{ fontSize: 15 }}>{selectedOrder.address}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong style={{ color: "#4a5568", display: "block" }}>
                                            Thành phố:
                                        </Text>
                                        <Text style={{ fontSize: 15 }}>{selectedOrder.city}</Text>
                                    </Col>
                                    <Col span={24}>
                                        <Text strong style={{ color: "#4a5568", display: "block", marginBottom: 8 }}>
                                            Trạng thái:
                                        </Text>
                                        {renderStatusTag(selectedOrder.status, orderStatusMap)}
                                    </Col>
                                </Row>
                            </Card>
                        )}

                        {/* Payment Information */}
                        {selectedOrderItems.length > 0 && selectedOrderItems[0].paymentDTO && (
                            <Card
                                style={{
                                    marginBottom: 24,
                                    borderRadius: 12,
                                    border: "1px solid #e6f7ff",
                                    background: "#f0f9ff"
                                }}
                                bodyStyle={{ padding: 20 }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                    <Avatar size={32} icon={<CreditCardOutlined />} style={{ background: "#1890ff" }} />
                                    <Title level={5} style={{ margin: 0, color: "#1a1a1a" }}>
                                        Thông tin thanh toán
                                    </Title>
                                </div>
                                <Row gutter={[16, 8]}>
                                    <Col span={8}>
                                        <Text strong style={{ color: "#4a5568" }}>
                                            Phương thức:
                                        </Text>
                                        <br />
                                        <Text style={{ fontSize: 15 }}>{selectedOrderItems[0].paymentDTO.method}</Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text strong style={{ color: "#4a5568" }}>
                                            Trạng thái:
                                        </Text>
                                        <br />
                                        {renderStatusTag(
                                            selectedOrderItems[0].paymentDTO?.status || "",
                                            paymentStatusMap
                                        )}
                                    </Col>
                                    <Col span={8}>
                                        <Text strong style={{ color: "#4a5568" }}>
                                            Số tiền:
                                        </Text>
                                        <br />
                                        <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                                            {formatCurrency(
                                                selectedOrderItems[0].paymentDTO.amount,
                                                selectedOrderItems[0].paymentDTO.method
                                            )}
                                        </Text>
                                    </Col>
                                </Row>
                            </Card>
                        )}

                        {/* Order Items */}
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "1px solid #f0f0f0"
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <Title level={5} style={{ marginBottom: 16, color: "#1a1a1a" }}>
                                Chi tiết sản phẩm
                            </Title>
                            {selectedOrderItems.length === 0 ? (
                                <Empty description="Không có sản phẩm nào trong đơn hàng này" style={{ padding: 20 }} />
                            ) : (
                                <>
                                    <Table
                                        dataSource={selectedOrderItems}
                                        columns={columnsItems}
                                        rowKey="id"
                                        pagination={false}
                                        style={{ marginBottom: 16 }}
                                    />
                                    <div
                                        style={{
                                            background: "#f8f9fa",
                                            padding: 16,
                                            borderRadius: 8,
                                            textAlign: "right"
                                        }}
                                    >
                                        <Text strong style={{ fontSize: 16 }}>
                                            Tổng cộng:{" "}
                                            <Text style={{ color: "#667eea", fontSize: 18 }}>
                                                {selectedOrderItems.length > 0 &&
                                                selectedOrderItems[0].paymentDTO?.method.toLowerCase() === "paypal"
                                                    ? formatCurrency(
                                                          selectedOrderItems.reduce(
                                                              (sum, item) => sum + item.price * item.quantity,
                                                              0
                                                          ) / usdToVndRate,
                                                          "paypal"
                                                      )
                                                    : `${selectedOrderItems
                                                          .reduce((sum, item) => sum + item.price * item.quantity, 0)
                                                          .toLocaleString()}₫`}
                                            </Text>
                                        </Text>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                )}
            </Modal>

            <AppFooter />
        </>
    );
};

export default AllOrdersPage;
