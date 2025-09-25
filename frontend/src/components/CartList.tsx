import React, { useState } from "react";
import { Button, Drawer, Badge, Divider, Empty, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { CartListProps } from "../types/types";
import CartItemCard from "./CartItemCard";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const CartList: React.FC<CartListProps> = ({ cart, userId, onUpdate, onRemove }) => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const navigate = useNavigate();

    const handleSelectItem = (id: number, isChecked: boolean) => {
        setSelectedItems((prev) => (isChecked ? [...prev, id] : prev.filter((itemId) => itemId !== id)));
    };

    const selectedTotalPrice = cart
    .filter((item) => selectedItems.includes(item.book.id))
    .reduce((sum, item) => {
        const unitPrice =
            item.book.discountPrice && item.book.discountPrice < item.book.originalPrice
                ? item.book.discountPrice
                : item.book.originalPrice;
        return sum + unitPrice * item.quantity;
    }, 0);


    return (
        <>
            <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<ShoppingCartOutlined />}
                style={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    width: 56,
                    height: 56,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                }}
                onClick={() => setDrawerVisible(true)}
            >
                <Badge count={cart.length} offset={[-8, 8]} />
            </Button>
            <Drawer
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ShoppingCartOutlined />
                        Giỏ hàng của bạn
                    </div>
                }
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={450}
            >
                {cart.length === 0 ? (
                    <Empty description="Giỏ hàng trống" />
                ) : (
                    <>
                        {cart.map((item) => (
                            <CartItemCard
                                key={item.book.id}
                                userId={userId}
                                item={item}
                                onUpdate={onUpdate}
                                onRemove={onRemove}
                                checked={selectedItems.includes(item.book.id)}
                                onSelect={handleSelectItem}
                            />
                        ))}
                        <Divider />
                        <div style={{ textAlign: "right" }}>
                            <Title level={4} style={{ color: "#1890ff", margin: "0 0 16px 0" }}>
                                Tổng: {new Intl.NumberFormat("vi-VN").format(selectedTotalPrice)}₫
                            </Title>
                            <Button
                                type="primary"
                                size="large"
                                disabled={selectedItems.length === 0}  
                                onClick={() =>
                                    navigate("/checkout", {
                                        state: {
                                            cart: cart.filter((item) => selectedItems.includes(item.book.id)),
                                            totalPrice: selectedTotalPrice,
                                            userId
                                        }
                                    })
                                }
                                style={{
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    border: "none",
                                    borderRadius: 8,
                                    fontWeight: 500,
                                    width: "100%"
                                }}
                            >
                                Thanh toán
                            </Button>
                        </div>
                    </>
                )}
            </Drawer>
        </>
    );
};

export default CartList;
