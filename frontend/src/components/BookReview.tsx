import React, { useState } from "react"; // 👉 thêm useState
import { Card, Rate, Typography, Form, Input, Button, List, Spin, message, Avatar, Space, Empty } from "antd";
import { UserOutlined, StarOutlined } from "@ant-design/icons";
import { BookReviewsProps } from "../types/types";

const { Text, Title } = Typography;

const BookReviews: React.FC<BookReviewsProps> = ({ bookId, userId, reviews, loading, onAddReview, form, rating }) => {
    const [visibleCount, setVisibleCount] = useState(5);
    const [messageApi, contextHolder] = message.useMessage();

    const handleShowMore = () => setVisibleCount((prev) => prev + 5);
    const handleCollapse = () => setVisibleCount(5);

    const handleFinish = async (values: { rating: number; message: string }) => {
        if (!userId) {
            messageApi.error("Bạn cần đăng nhập để đánh giá!");
            return;
        }
        await onAddReview(values);
        form.resetFields();
        messageApi.success("Đánh giá của bạn đã được thêm!");
    };

    return (
        <Card
            style={{
                marginBottom: 24,
                borderRadius: 16,
                border: "none",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
            }}
        >
            {contextHolder}
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                    paddingBottom: 16,
                    borderBottom: "1px solid #f0f0f0"
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <StarOutlined style={{ fontSize: 20, color: "white" }} />
                </div>
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        Đánh giá sản phẩm
                    </Title>
                    <Text type="secondary">Chia sẻ trải nghiệm của bạn</Text>
                </div>
            </div>

            {/* Rating trung bình */}
            <div
                style={{
                    background: "#fafafa",
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 24,
                    textAlign: "center"
                }}
            >
                <Text strong style={{ fontSize: 16 }}>
                    Đánh giá trung bình
                </Text>
                <div style={{ margin: "8px 0" }}>
                    <Rate disabled allowHalf value={rating || 0} />
                </div>
                <Text style={{ fontSize: 18, fontWeight: 600, color: "#1890ff" }}>{(rating || 0).toFixed(1)}/5.0</Text>
                <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                    ({reviews.length} đánh giá)
                </Text>
            </div>

            {/* Form đánh giá */}
            {userId ? (
                <Card
                    size="small"
                    title="Viết đánh giá của bạn"
                    style={{
                        marginBottom: 24,
                        background: "#f9f9f9",
                        border: "1px solid #e6f7ff"
                    }}
                >
                    <Form form={form} onFinish={handleFinish} layout="vertical">
                        <Form.Item
                            name="rating"
                            label="Chấm điểm"
                            rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
                        >
                            <Rate style={{ fontSize: 20 }} />
                        </Form.Item>
                        <Form.Item
                            name="message"
                            label="Nhận xét"
                            rules={[{ required: true, message: "Vui lòng viết nhận xét" }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                                showCount
                                maxLength={500}
                            />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    border: "none",
                                    borderRadius: 6,
                                    fontWeight: 500
                                }}
                            >
                                Gửi đánh giá
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            ) : (
                <Card
                    size="small"
                    style={{
                        marginBottom: 24,
                        background: "#fff7e6",
                        border: "1px solid #ffd591",
                        textAlign: "center"
                    }}
                >
                    <Text type="secondary">Bạn cần đăng nhập để có thể đánh giá sản phẩm</Text>
                </Card>
            )}

            {/* Danh sách review */}
            <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                    Tất cả đánh giá ({reviews.length})
                </Title>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 32 }}>
                        <Spin size="large" />
                        <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
                            Đang tải đánh giá...
                        </Text>
                    </div>
                ) : reviews.length === 0 ? (
                    <Empty description="Chưa có đánh giá nào" style={{ padding: 32 }} />
                ) : (
                    <>
                        <List
                            dataSource={reviews.slice(0, visibleCount)} // 👉 giới hạn số lượng
                            renderItem={(review, index) => (
                                <List.Item
                                    style={{
                                        padding: "16px 0",
                                        borderBottom: index === reviews.length - 1 ? "none" : "1px solid #f0f0f0"
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                style={{ backgroundColor: "#1890ff", fontSize: 16 }}
                                                icon={<UserOutlined />}
                                            />
                                        }
                                        title={
                                            <div>
                                                <Space>
                                                    <Text strong style={{ fontSize: 15 }}>
                                                        {review.firstName} {review.lastName}
                                                    </Text>
                                                    <Rate
                                                        disabled
                                                        defaultValue={review.rating}
                                                        style={{ fontSize: 14 }}
                                                    />
                                                </Space>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12, display: "block", marginTop: 4 }}
                                                >
                                                    {review.date ? new Date(review.date).toLocaleString("vi-VN") : ""}
                                                </Text>
                                            </div>
                                        }
                                        description={
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                    marginTop: 8,
                                                    display: "block"
                                                }}
                                            >
                                                {review.message}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        {/* Nút xem thêm / thu gọn */}
                        {reviews.length > 5 && (
                            <div style={{ textAlign: "center", marginTop: 16 }}>
                                {visibleCount < reviews.length ? (
                                    <Button type="link" onClick={handleShowMore}>
                                        Xem thêm
                                    </Button>
                                ) : (
                                    <Button type="link" onClick={handleCollapse}>
                                        Thu gọn
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

export default BookReviews;
