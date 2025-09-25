import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    Card,
    Typography,
    Spin,
    Modal,
    Button,
    message,
    Space,
    Row,
    Col,
    Tag,
    Avatar,
    Empty,
    Statistic,
    DatePicker,
    Select,
    Input
} from "antd";
import {
    ShoppingOutlined,
    CalendarOutlined,
    DollarCircleOutlined,
    EyeOutlined,
    UserOutlined,
    CreditCardOutlined,
    BookOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getOrdersByUser, getOrderItems } from "../api/orderApi";
import { OrderDTO, OrderItemDTO } from "../types/types";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

dayjs.extend(isBetween);

const formatCurrency = (amount: number, method: string): string => {
    if (method.toLowerCase() === "paypal") {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    } else {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    }
};

const UserOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItemDTO[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

    // Filter states
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [searchText, setSearchText] = useState<string>("");

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

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

            // Status filter
            if (statusFilter && order.status !== statusFilter) {
                return false;
            }

            // Search filter - search in address, order ID, or any text field
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const orderIdString = `#${order.id?.toString().padStart(6, "0")}`;
                const address = `${order.address || ""}`.toLowerCase();

                if (!orderIdString.includes(searchLower) && !address.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }, [orders, dateRange, statusFilter, searchText]);

    // Calculate statistics for filtered orders
    const statistics = useMemo(() => {
        const totalOrders = filteredOrders.length;
        const processingOrders = filteredOrders.filter(
            (o) => o.status === "PENDING" || o.status === "PROCESSING"
        ).length;
        const deliveredOrders = filteredOrders.filter((o) => o.status === "DELIVERED").length;
        const totalSpent = filteredOrders
            .filter((o) => o.status === "DELIVERED")
            .reduce((sum, o) => sum + o.totalPrice, 0);

        return {
            totalOrders,
            processingOrders,
            deliveredOrders,
            totalSpent
        };
    }, [filteredOrders]);

    const clearFilters = () => {
        setDateRange([null, null]);
        setStatusFilter("");
        setSearchText("");
    };

    useEffect(() => {
        if (!user.id) {
            message.error("Không tìm thấy thông tin người dùng!");
            setLoading(false);
            return;
        }

        getOrdersByUser(user.id)
            .then((data) => setOrders(data))
            .catch(() => message.error("Lấy đơn hàng thất bại!"))
            .finally(() => setLoading(false));
    }, [user.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "orange";
            case "PROCESSING":
                return "blue";
            case "SHIPPED":
                return "cyan";
            case "DELIVERED":
                return "green";
            case "CANCELED":
                return "red";
            case "FAILED":
                return "red";
            case "REFUNDED":
                return "purple";
            default:
                return "default";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Chờ xử lý";
            case "PROCESSING":
                return "Đang xử lý";
            case "SHIPPED":
                return "Đã gửi hàng";
            case "DELIVERED":
                return "Đã giao hàng";
            case "CANCELED":
                return "Đã hủy";
            case "FAILED":
                return "Thất bại";
            case "REFUNDED":
                return "Đã hoàn tiền";
            default:
                return status;
        }
    };

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

    const showOrderItems = (order: OrderDTO) => {
        if (!order.id) return;

        setSelectedOrder(order);
        setModalVisible(true);
        setModalLoading(true);

        getOrderItems(order.id)
            .then((items) => {
                const itemsWithPayment = items.map((item) => ({
                    ...item,
                    paymentDTO: order.payment
                }));
                setSelectedOrderItems(itemsWithPayment);
            })
            .catch(() => message.error("Không thể tải chi tiết đơn hàng!"))
            .finally(() => setModalLoading(false));
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
            render: (status: string) => (
                <Tag color={getStatusColor(status)} style={{ fontWeight: 500 }}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: "Địa chỉ giao hàng",
            dataIndex: "address",
            key: "address",
            render: (address: string) => (
                <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: address }}>
                    {address}
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
                    onClick={() => showOrderItems(record)}
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
                if (record.paymentDTO) {
                    if (record.paymentDTO.method.toLowerCase() === "paypal") {
                        return (
                            <Text strong style={{ color: "#667eea" }}>
                                {formatCurrency(record.paymentDTO.amount, "paypal")}
                            </Text>
                        );
                    } else {
                        return (
                            <Text strong style={{ color: "#667eea" }}>
                                {formatCurrency(price, "vnd")}
                            </Text>
                        );
                    }
                } else {
                    return (
                        <Text strong style={{ color: "#667eea" }}>
                            {price.toLocaleString()}₫
                        </Text>
                    );
                }
            }
        }
    ];

    if (loading) {
        return (
            <>
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
                                icon={<UserOutlined />}
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
                                    Đơn hàng của {user.firstName} {user.lastName}
                                </Title>
                                <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
                                    Lịch sử mua hàng và theo dõi đơn hàng
                                </Text>
                            </div>
                        </div>
                    </Card>

                    {/* Statistics Cards */}
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6}>
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
                        <Col xs={24} sm={12} md={6}>
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
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    borderRadius: 12,
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <Statistic
                                    title="Đã giao hàng"
                                    value={statistics.deliveredOrders}
                                    prefix={<DollarCircleOutlined style={{ color: "#52c41a" }} />}
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    borderRadius: 12,
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <Statistic
                                    title="Tổng chi tiêu"
                                    value={statistics.totalSpent}
                                    prefix={<DollarCircleOutlined style={{ color: "#722ed1" }} />}
                                    valueStyle={{ color: "#722ed1", fontSize: 16 }}
                                    formatter={(value) => `${Number(value).toLocaleString()}₫`}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Orders Table */}
                    <Card
                        style={{
                            borderRadius: 16,
                            border: "none",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        {orders.length === 0 ? (
                            <Empty description="Chưa có đơn hàng nào" style={{ padding: 48 }} />
                        ) : (
                            <>
                                {/* Filter UI */}
                                <Row gutter={[16, 16]} style={{ marginBottom: 16, alignItems: "middle" }}>
                                    <Col xs={24} sm={12} md={6}>
                                        <RangePicker
                                            value={dateRange}
                                            style={{ width: "100%" }}
                                            onChange={(dates) =>
                                                setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
                                            }
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={4}>
                                        <Select
                                            placeholder="Chọn trạng thái"
                                            value={statusFilter}
                                            onChange={(value) => setStatusFilter(value)}
                                            style={{ width: "100%" }}
                                            allowClear
                                        >
                                            <Option value="PENDING">Chờ xử lý</Option>
                                            <Option value="PROCESSING">Đang xử lý</Option>
                                            <Option value="DELIVERED">Đã giao hàng</Option>
                                            <Option value="CANCELED">Đã hủy</Option>
                                        </Select>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Input
                                            placeholder="Tìm kiếm theo địa chỉ hoặc mã đơn hàng"
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            style={{ width: "100%" }}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={4}>
                                        <Button onClick={clearFilters} style={{ width: "100%" }}>
                                            Xóa lọc
                                        </Button>
                                    </Col>
                                </Row>

                                {/* Orders Table */}
                                <Table
                                    dataSource={filteredOrders} // ← dùng filteredOrders chứ không phải orders
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
                            </>
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
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setModalVisible(false)}
                        style={{
                            borderRadius: 6,
                            fontWeight: 500
                        }}
                    >
                        Đóng
                    </Button>
                ]}
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
                ) : (
                    <div>
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
                                        <Tag
                                            color={
                                                selectedOrderItems[0].paymentDTO.status === "PENDING"
                                                    ? "orange"
                                                    : "green"
                                            }
                                            style={{ fontWeight: 500 }}
                                        >
                                            {selectedOrderItems[0].paymentDTO.status}
                                        </Tag>
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
                                                {selectedOrderItems
                                                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                                                    .toLocaleString()}
                                                ₫
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

export default UserOrdersPage;
