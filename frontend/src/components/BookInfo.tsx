import React, { useState } from "react";
import { Card, Typography, Carousel, Image, InputNumber, Button, Space, Row, Col, Tag } from "antd";
import { ShoppingCartOutlined, StarOutlined } from "@ant-design/icons";
import { BookInfoProps } from "../types/types";

const { Title, Text, Paragraph } = Typography;

const BookInfo: React.FC<BookInfoProps> = ({ book, userId, addToCart }) => {
    const [quantity, setQuantity] = useState<number>(1);

    const maxQuantity = (book.stock ?? 0) - (book.sold ?? 0);

    return (
        <Card
            style={{
                marginBottom: 24,
                borderRadius: 16,
                border: "none",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                overflow: "hidden"
            }}
        >
            <Row gutter={[24, 24]}>
                {/* Ảnh sách */}
                <Col xs={24} md={10}>
                    {book.coverImages && book.coverImages.length > 0 && (
                        <div style={{ textAlign: "center" }}>
                            {book.coverImages.length === 1 ? (
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <Image
                                        src={book.coverImages[0]}
                                        alt={book.title}
                                        style={{
                                            width: "100%",
                                            height: 400,
                                            objectFit: "contain",
                                            borderRadius: 12,
                                            background: "#fff"
                                        }}
                                    />
                                    {book.discountPrice && book.discountPrice < book.originalPrice && (
                                        <Tag
                                            color="red"
                                            style={{
                                                position: "absolute",
                                                top: 12,
                                                left: 12,
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                padding: "6px 12px",
                                                borderRadius: 8
                                            }}
                                        >
                                            -
                                            {Math.round(
                                                ((book.originalPrice - book.discountPrice) / book.originalPrice) * 100
                                            )}
                                            %
                                        </Tag>
                                    )}
                                </div>
                            ) : (
                                <Carousel autoplay style={{ borderRadius: 12, overflow: "hidden" }}>
                                    {book.coverImages.map((img, index) => (
                                        <div key={index} style={{ textAlign: "center" }}>
                                            <Image
                                                src={img}
                                                alt={`${book.title}-${index}`}
                                                style={{
                                                    width: "100%",
                                                    height: 400,
                                                    objectFit: "contain",
                                                    borderRadius: 12,
                                                    background: "#fff"
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            )}
                        </div>
                    )}
                </Col>

                {/* Thông tin sách */}
                <Col xs={24} md={14}>
                    <div style={{ padding: "0 16px" }}>
                        <Title level={2} style={{ margin: "0 0 16px 0", color: "#262626" }}>
                            {book.title}
                        </Title>

                        <Space direction="vertical" size={12} style={{ width: "100%" }}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
                                    Tác giả
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>
                                    {book.author}
                                </Text>
                            </div>

                            <div>
                                <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
                                    Thể loại
                                </Text>
                                <Tag color="blue" style={{ fontSize: 13, padding: "4px 12px" }}>
                                    {book.category}
                                </Tag>
                            </div>

                            <div>
                                <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
                                    Nhà xuất bản
                                </Text>
                                <Text style={{ fontSize: 15 }}>{book.publisher}</Text>
                            </div>

                            {/* Giá bán */}
                            <div>
                                <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
                                    Giá bán
                                </Text>

                                {book.discountPrice && book.discountPrice < book.originalPrice ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {/* Giá gốc */}
                                        <Text delete style={{ fontSize: 16, color: "#999" }}>
                                            {new Intl.NumberFormat("vi-VN").format(book.originalPrice)}₫
                                        </Text>

                                        {/* Giá giảm */}
                                        <Text strong style={{ fontSize: 24, color: "#ff4d4f" }}>
                                            {new Intl.NumberFormat("vi-VN").format(book.discountPrice)}₫
                                        </Text>

                                        {/* Badge % giảm */}
                                        <Tag color="red" style={{ fontWeight: "bold", fontSize: 14 }}>
                                            -
                                            {Math.round(
                                                ((book.originalPrice - book.discountPrice) / book.originalPrice) * 100
                                            )}
                                            %
                                        </Tag>
                                    </div>
                                ) : (
                                    <Text strong style={{ fontSize: 24, color: "#1890ff" }}>
                                        {new Intl.NumberFormat("vi-VN").format(book.originalPrice)}₫
                                    </Text>
                                )}
                            </div>

                            <div>
                                <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
                                    Tồn kho
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: maxQuantity > 0 ? "#52c41a" : "#ff4d4f",
                                        fontWeight: 500
                                    }}
                                >
                                    {maxQuantity > 0 ? `Còn ${maxQuantity} cuốn` : "Hết hàng"}
                                </Text>
                            </div>

                            {book.rating && (
                                <div>
                                    <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
                                        Đánh giá
                                    </Text>
                                    <Space>
                                        <StarOutlined style={{ color: "#faad14" }} />
                                        <Text strong>{book.rating.toFixed(1)}/5</Text>
                                    </Space>
                                </div>
                            )}
                        </Space>

                        {/* Chọn số lượng + thêm giỏ */}
                        <div
                            style={{
                                marginTop: 32,
                                padding: "24px 0",
                                borderTop: "1px solid #f0f0f0"
                            }}
                        >
                            <Space size={16}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
                                        Số lượng
                                    </Text>
                                    <InputNumber
                                        min={1}
                                        max={maxQuantity}
                                        value={quantity}
                                        onChange={(val) => setQuantity(val || 1)}
                                        style={{ width: 80 }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ height: 22 }}></div>
                                    <Button
                                        type="primary"
                                        size="large"
                                        disabled={maxQuantity <= 0}
                                        onClick={() => addToCart(book, quantity)}
                                        icon={<ShoppingCartOutlined />}
                                        style={{
                                            borderRadius: 8,
                                            fontWeight: 500,
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            border: "none",
                                            height: 48,
                                            minWidth: 180
                                        }}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                </div>
                            </Space>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Mô tả sách */}
            <div
                style={{
                    marginTop: 32,
                    padding: "24px 0 0 0",
                    borderTop: "1px solid #f0f0f0"
                }}
            >
                <Title level={4} style={{ marginBottom: 16 }}>
                    Mô tả sách
                </Title>
                <Paragraph
                    style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "#595959",
                        textAlign: "justify"
                    }}
                >
                    {book.description}
                </Paragraph>
            </div>
        </Card>
    );
};

export default BookInfo;
