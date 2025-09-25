import React from "react";
import { CartItemCardProps } from "../types/types";
import { Button, Card, Row, Col, Typography, Image, Checkbox } from "antd";
import { PlusOutlined, MinusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const CartItemCard: React.FC<CartItemCardProps> = ({ userId, item, onUpdate, onRemove, checked, onSelect }) => {
    return (
        <Card
            style={{
                marginBottom: 12,
                borderRadius: 8,
                border: checked ? "2px solid #1890ff" : "1px solid #f0f0f0",
                boxShadow: checked ? "0 2px 8px rgba(24, 144, 255, 0.15)" : "0 1px 4px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s ease"
            }}
            bodyStyle={{
                padding: 12,
                background: checked ? "#f6f8ff" : "#ffffff"
            }}
        >
            <Row gutter={12} align="middle">
                {/* Checkbox */}
                <Col span={1}>
                    <Checkbox checked={checked} onChange={(e) => onSelect(item.book.id!, e.target.checked)} />
                </Col>

                {/* Book Image */}
                <Col span={5}>
                    <div
                        style={{
                            width: "100%",
                            aspectRatio: "3/4",
                            borderRadius: 4,
                            overflow: "hidden"
                        }}
                    >
                        {item.book.coverImages && item.book.coverImages.length > 0 ? (
                            <Image
                                src={item.book.coverImages[0]}
                                alt={item.book.title}
                                width="100%"
                                height="100%"
                                style={{
                                    objectFit: "cover",
                                    borderRadius: 4
                                }}
                                preview={false}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(135deg, #f5f5f5, #e8e8e8)",
                                    borderRadius: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#bfbfbf",
                                    fontSize: 16
                                }}
                            >
                                📚
                            </div>
                        )}
                    </div>
                </Col>

                {/* Book Info */}
                <Col span={10}>
                    <div>
                        <Title
                            level={5}
                            style={{
                                margin: "0 0 4px 0",
                                fontSize: 13,
                                fontWeight: 600,
                                lineHeight: 1.2,
                                color: "#262626"
                            }}
                        >
                            {item.book.title}
                        </Title>

                        <Text
                            type="secondary"
                            style={{
                                fontSize: 11,
                                display: "block",
                                marginBottom: 4
                            }}
                        >
                            {item.book.author}
                        </Text>

                        {/* Giá hiển thị */}
                        {item.book.discountPrice && item.book.discountPrice < item.book.originalPrice ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <Text delete style={{ fontSize: 11, color: "#999" }}>
                                    {item.book.originalPrice.toLocaleString()}₫
                                </Text>
                                <Text strong style={{ fontSize: 13, color: "#ff4d4f" }}>
                                    {item.book.discountPrice.toLocaleString()}₫
                                </Text>
                            </div>
                        ) : (
                            <Text strong style={{ fontSize: 13, color: "#1890ff", display: "block", marginBottom: 4 }}>
                                {item.book.originalPrice.toLocaleString()}₫
                            </Text>
                        )}

                        {item.book.category && (
                            <Text
                                style={{
                                    fontSize: 9,
                                    background: "#f0f0f0",
                                    padding: "1px 4px",
                                    borderRadius: 2,
                                    color: "#666"
                                }}
                            >
                                {item.book.category}
                            </Text>
                        )}
                    </div>
                </Col>

                {/* Quantity and Actions */}
                <Col span={8}>
                    <div style={{ textAlign: "right" }}>
                        {/* Quantity Controls */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                marginBottom: 8,
                                gap: 4
                            }}
                        >
                            <Button
                                size="small"
                                shape="circle"
                                icon={<MinusOutlined />}
                                onClick={() => onUpdate(item.book.id!, -1)}
                                disabled={item.quantity <= 1}
                                style={{
                                    border: "1px solid #d9d9d9",
                                    width: 24,
                                    height: 24,
                                    fontSize: 10
                                }}
                            />

                            <div
                                style={{
                                    minWidth: 32,
                                    height: 24,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#fafafa",
                                    fontSize: 12,
                                    fontWeight: 500
                                }}
                            >
                                {item.quantity}
                            </div>

                            <Button
                                size="small"
                                shape="circle"
                                icon={<PlusOutlined />}
                                onClick={() => onUpdate(item.book.id!, 1)}
                                style={{
                                    border: "1px solid #d9d9d9",
                                    width: 24,
                                    height: 24,
                                    fontSize: 10
                                }}
                            />
                        </div>
                        {/* Subtotal */}
                        <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 10, display: "block" }}>
                                Tổng
                            </Text>
                            <Text strong style={{ fontSize: 13, color: "#1890ff" }}>
                                {(
                                    (item.book.discountPrice && item.book.discountPrice < item.book.originalPrice
                                        ? item.book.discountPrice
                                        : item.book.originalPrice) * item.quantity
                                ).toLocaleString()}
                                ₫
                            </Text>
                        </div>

                        {/* Remove Button */}
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => onRemove(item.book.id!)}
                            style={{
                                borderRadius: 4,
                                fontWeight: 500,
                                fontSize: 10,
                                width: "100%",
                                height: 24
                            }}
                        >
                            Xóa
                        </Button>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default CartItemCard;
