import React, { useEffect, useState, useMemo } from "react";
import {
    Card,
    Row,
    Col,
    Button,
    message,
    Space,
    Skeleton,
    Typography,
    Empty,
    InputNumber,
    Input,
    Select,
    Layout,
    Pagination
} from "antd";
import { SearchOutlined, FilterOutlined, StarOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { BookDTO } from "../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import CartList from "../components/CartList";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import { useCart } from "../hooks/useCart";

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const userId = user?.id;

    const { cart, fetchCart, addToCart, handleUpdateQuantity, handleRemove, contextHolder } = useCart(userId);

    const [books, setBooks] = useState<BookDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    const fetchActiveBooks = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/books/active");
            const data: BookDTO[] = res.data.data || [];
            setBooks(data);

            const initial: Record<number, number> = {};
            data.forEach((b) => {
                initial[b.id!] = 1;
            });
            setQuantities(initial);
        } catch {
            message.error("Lấy danh sách sách thất bại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveBooks();
        fetchCart();
    }, [userId]);

    const totalPrice = cart.reduce((sum, item) => {
        const finalPrice =
            item.book.discountPrice && item.book.discountPrice > 0 ? item.book.discountPrice : item.book.originalPrice;
        return sum + finalPrice * item.quantity;
    }, 0);

    const categories = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));

    const filteredBooks = useMemo(() => {
        return books.filter((book) => {
            const matchesSearch =
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [books, searchTerm, selectedCategory]);

    // Paginated books
    const paginatedBooks = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredBooks.slice(startIndex, endIndex);
    }, [filteredBooks, currentPage, pageSize]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size && size !== pageSize) {
            setPageSize(size);
        }
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const renderBooks = () => {
        if (loading) {
            return (
                <Row gutter={[24, 24]}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={i}>
                            <Card style={{ borderRadius: 12, overflow: "hidden" }}>
                                <Skeleton.Image style={{ width: "100%", height: 280 }} active />
                                <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            );
        }

        if (filteredBooks.length === 0) {
            return (
                <Empty
                    description={
                        searchTerm || selectedCategory ? "Không tìm thấy sách phù hợp với bộ lọc" : "Không có sách nào"
                    }
                    style={{ padding: 48 }}
                />
            );
        }

        return (
            <>
                <Row gutter={[24, 24]}>
                    {paginatedBooks.map((book) => {
                        const maxQuantity = (book.stock ?? 0) - (book.sold ?? 0);
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                                <Card
                                    hoverable
                                    onClick={() => navigate(`/books/${book.id}`)}
                                    style={{
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        transition: "all 0.3s ease",
                                        height: "100%"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                                    }}
                                    cover={
                                        <div style={{ position: "relative", overflow: "hidden" }}>
                                            <img
                                                alt={book.title}
                                                src={book.coverImages?.[0] || "https://via.placeholder.com/300x400"}
                                                style={{
                                                    width: "100%",
                                                    height: 280,
                                                    objectFit: "cover",
                                                    transition: "transform 0.3s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.05)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }}
                                            />

                                            {/* Badge phần trăm giảm giá */}
                                            {book.discountPrice && book.discountPrice > 0 && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: 12,
                                                        left: 12,
                                                        background: "rgba(255,77,79,0.95)",
                                                        color: "white",
                                                        padding: "4px 8px",
                                                        borderRadius: 6,
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                                                    }}
                                                >
                                                    -
                                                    {Math.round(
                                                        ((book.originalPrice - book.discountPrice) /
                                                            book.originalPrice) *
                                                            100
                                                    )}
                                                    %
                                                </div>
                                            )}

                                            {/* Badge hết hàng */}
                                            {maxQuantity <= 0 && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: 12,
                                                        right: 12,
                                                        background: "#ff4d4f",
                                                        color: "white",
                                                        padding: "4px 8px",
                                                        borderRadius: 6,
                                                        fontSize: 12,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Hết hàng
                                                </div>
                                            )}
                                        </div>
                                    }
                                >
                                    <div style={{ padding: "16px 0 0 0" }}>
                                        <Title
                                            level={5}
                                            style={{
                                                margin: "0 0 8px 0",
                                                fontSize: 16,
                                                fontWeight: 600,
                                                lineHeight: 1.3,
                                                height: 42,
                                                overflow: "hidden",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical"
                                            }}
                                        >
                                            {book.title}
                                        </Title>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 13, display: "block", marginBottom: 8 }}
                                        >
                                            {book.author}
                                        </Text>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: 12
                                            }}
                                        >
                                            <div>
                                                {book.discountPrice && book.discountPrice > 0 ? (
                                                    <>
                                                        <Text
                                                            strong
                                                            style={{ fontSize: 16, color: "#ff4d4f", marginRight: 8 }}
                                                        >
                                                            {new Intl.NumberFormat("vi-VN").format(book.discountPrice)}₫
                                                        </Text>
                                                        <Text delete type="secondary" style={{ fontSize: 14 }}>
                                                            {new Intl.NumberFormat("vi-VN").format(book.originalPrice)}₫
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                                                        {new Intl.NumberFormat("vi-VN").format(book.originalPrice)}₫
                                                    </Text>
                                                )}
                                            </div>

                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    color: maxQuantity > 0 ? "#52c41a" : "#ff4d4f",
                                                    fontWeight: 500
                                                }}
                                            >
                                                {maxQuantity > 0 ? `Còn ${maxQuantity}` : "Hết hàng"}
                                            </Text>
                                        </div>
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: 12,
                                                display: "block",
                                                marginBottom: 16,
                                                background: "#f5f5f5",
                                                padding: "4px 8px",
                                                borderRadius: 4,
                                                textAlign: "center"
                                            }}
                                        >
                                            {book.category}
                                        </Text>
                                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                                            <InputNumber
                                                min={1}
                                                max={maxQuantity}
                                                value={quantities[book.id!] || 1}
                                                onChange={(val) =>
                                                    setQuantities((prev) => ({
                                                        ...prev,
                                                        [book.id!]: val || 1
                                                    }))
                                                }
                                                style={{ width: 60 }}
                                                size="small"
                                            />
                                            <Button
                                                type="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(book, quantities[book.id!] || 1);
                                                }}
                                                disabled={maxQuantity <= 0}
                                                style={{
                                                    borderRadius: 8,
                                                    fontWeight: 500,
                                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                                    border: "none",
                                                    flex: 1,
                                                    marginLeft: 8
                                                }}
                                                size="small"
                                            >
                                                Thêm vào giỏ
                                            </Button>
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Pagination */}
                {filteredBooks.length > 0 && (
                    <Card
                        style={{
                            marginTop: 32,
                            borderRadius: 12,
                            border: "none",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
                        }}
                        bodyStyle={{ padding: "20px 24px" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredBooks.length)} -{" "}
                                {Math.min(currentPage * pageSize, filteredBooks.length)} của {filteredBooks.length} sách
                                {(searchTerm || selectedCategory) && ` (đã lọc từ ${books.length} sách)`}
                            </Text>
                            <Pagination
                                current={currentPage}
                                total={filteredBooks.length}
                                pageSize={pageSize}
                                showSizeChanger
                                showQuickJumper
                                pageSizeOptions={["12", "24", "48", "96"]}
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageChange}
                                style={{ marginLeft: 16 }}
                                showTotal={(total, range) => (
                                    <Text type="secondary" style={{ fontSize: 14, marginRight: 16 }}>
                                        Trang {currentPage} / {Math.ceil(total / pageSize)}
                                    </Text>
                                )}
                            />
                        </div>
                    </Card>
                )}
            </>
        );
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {contextHolder}

            {/* Header */}
            <AppHeader />

            {/* Content */}
            <Content style={{ padding: "24px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Card
                        style={{
                            marginBottom: 24,
                            borderRadius: 12,
                            border: "none",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
                        }}
                    >
                        <Row gutter={16} align="middle">
                            <Col flex="auto">
                                <Input
                                    placeholder="Tìm sách theo tên hoặc tác giả..."
                                    prefix={<SearchOutlined />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="large"
                                    style={{ borderRadius: 8 }}
                                />
                            </Col>
                            <Col>
                                <Select
                                    placeholder="Chọn thể loại"
                                    allowClear
                                    value={selectedCategory || undefined}
                                    onChange={(val) => setSelectedCategory(val || null)}
                                    style={{ width: 200 }}
                                    size="large"
                                    suffixIcon={<FilterOutlined />}
                                >
                                    {categories.map((cat) => (
                                        <Option key={cat} value={cat}>
                                            {cat}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    </Card>

                    {/* Books Grid */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24
                        }}
                    >
                        <Title level={3} style={{ margin: 0 }}>
                            <StarOutlined /> Sách nổi bật
                        </Title>
                        {filteredBooks.length > 0 && (
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                {filteredBooks.length} sách
                                {(searchTerm || selectedCategory) && ` (đã lọc)`}
                            </Text>
                        )}
                    </div>
                    {renderBooks()}
                </div>
            </Content>

            <AppFooter />

            {/* Floating Cart Button */}
            <CartList cart={cart} userId={userId!} onUpdate={handleUpdateQuantity} onRemove={handleRemove} />
        </Layout>
    );
};

export default Dashboard;
