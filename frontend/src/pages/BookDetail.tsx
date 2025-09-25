import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Form, Typography, Layout, Button, Card } from "antd";
import { ArrowLeftOutlined, BookOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { BookDTO, ReviewDTO } from "../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useCart } from "../hooks/useCart";
import CartList from "../components/CartList";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import BookInfo from "../components/BookInfo";
import BookReviews from "../components/BookReview";

const { Text, Title } = Typography;
const { Content } = Layout;

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const userId = user?.id;
    const [form] = Form.useForm();

    const [book, setBook] = useState<BookDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<ReviewDTO[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const { cart, handleUpdateQuantity, handleRemove, addToCart, contextHolder, fetchCart } = useCart(userId);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await axiosClient.get(`/books/${id}`);
                setBook(res.data.data);
                fetchCart();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            setLoadingReviews(true);
            try {
                const res = await axiosClient.get(`/reviews/book/${id}`);
                setReviews(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [id]);

    const handleAddReview = async (values: { rating: number; message: string }) => {
        if (!id || !userId) return;
        try {
            const payload = {
                rating: values.rating,
                message: values.message,
                bookId: parseInt(id),
                userId: userId
            };
            const res = await axiosClient.post(`/reviews/book/${id}`, payload);
            setReviews((prev) => [res.data.data, ...prev]);

            const bookRes = await axiosClient.get(`/books/${id}`);
            setBook(bookRes.data.data);
        } catch (err) {
            console.error("Lỗi khi thêm review", err);
        }
    };

    if (loading) {
        return (
            <Layout
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        flexDirection: "column",
                        gap: 16
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
                        }}
                    >
                        <BookOutlined style={{ fontSize: 28, color: "white" }} />
                    </div>
                    <Spin size="large" />
                    <Text type="secondary">Đang tải thông tin sách...</Text>
                </div>
            </Layout>
        );
    }

    if (!book) {
        return (
            <Layout
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        gap: 24
                    }}
                >
                    <Card
                        style={{
                            padding: 32,
                            borderRadius: 16,
                            textAlign: "center",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
                        }}
                    >
                        <Title level={3} style={{ color: "#ff4d4f", margin: "0 0 16px 0" }}>
                            Không tìm thấy sách
                        </Title>
                        <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
                            Sách bạn tìm kiếm không tồn tại hoặc đã bị xóa
                        </Text>
                        <Button
                            type="primary"
                            onClick={() => navigate("/dashboard")}
                            style={{
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none",
                                borderRadius: 8,
                                fontWeight: 500
                            }}
                        >
                            Quay lại trang chủ
                        </Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
            }}
        >
            {contextHolder}
            <AppHeader />
            <Content
                style={{
                    padding: "24px",
                    maxWidth: 1000,
                    margin: "0 auto",
                    width: "100%"
                }}
            >
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/dashboard")}
                    style={{
                        marginBottom: 24,
                        borderRadius: 8,
                        border: "1px solid #667eea",
                        color: "#667eea",
                        fontWeight: 500,
                        height: 36
                    }}
                    onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.backgroundColor = "#667eea";
                        target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.backgroundColor = "transparent";
                        target.style.color = "#667eea";
                    }}
                >
                    Quay lại
                </Button>

                <BookInfo book={book} userId={userId} addToCart={addToCart} />

                <BookReviews
                    bookId={book.id}
                    userId={userId}
                    reviews={reviews}
                    loading={loadingReviews}
                    onAddReview={handleAddReview}
                    form={form}
                    rating={book.rating}
                />
            </Content>
            <AppFooter />
            <CartList cart={cart} userId={userId!} onUpdate={handleUpdateQuantity} onRemove={handleRemove} />
        </Layout>
    );
};

export default BookDetail;
