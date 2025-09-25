import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { BookDTO, CartItemDTO } from "../types/types";
import { message } from "antd";

export const useCart = (userId?: number) => {
    const [cart, setCart] = useState<CartItemDTO[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    const fetchCart = async () => {
        if (!userId) return;
        try {
            const res = await axiosClient.get(`/cart?userId=${userId}`);
            setCart(res.data.data?.items || []);
        } catch {
            messageApi.error("Lấy giỏ hàng thất bại!");
        }
    };

    const addToCart = async (book: BookDTO, quantity: number) => {
        if (!userId) {
            messageApi.warning("Vui lòng đăng nhập để mua hàng!");
            return;
        }
        const existing = cart.find((item) => item.book.id === book.id);
        const maxQuantity = (book.stock ?? 0) - (book.sold ?? 0);
        const newQuantity = existing ? existing.quantity + quantity : quantity;

        if (newQuantity > maxQuantity) {
            messageApi.warning("Số lượng trong giỏ không được vượt quá tồn kho");
            return;
        }

        try {
            await axiosClient.post(`/cart/add?userId=${userId}&bookId=${book.id}&quantity=${quantity}`);
            messageApi.success(`${book.title} đã được thêm vào giỏ hàng!`);
            fetchCart();
        } catch {
            messageApi.error("Thêm vào giỏ hàng thất bại");
        }
    };

    const handleUpdateQuantity = async (bookId: number, delta: number) => {
        if (!userId) return;
        let newQuantity = 1;

        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.book.id === bookId) {
                    const updatedQty = Math.max(1, item.quantity + delta);
                    newQuantity = updatedQty;
                    return { ...item, quantity: updatedQty };
                }
                return item;
            })
        );

        try {
            await axiosClient.put("/cart/update", null, {
                params: { userId, bookId, newQuantity }
            });
        } catch {
            messageApi.error("Cập nhật giỏ hàng thất bại");
            fetchCart();
        }
    };

    const handleRemove = async (bookId: number) => {
        if (!userId) return;
        try {
            await axiosClient.delete("/cart/remove", { params: { userId, bookId } });
            fetchCart();
        } catch {
            messageApi.error("Xóa sản phẩm thất bại");
        }
    };

    return {
        cart,
        setCart,
        fetchCart,
        addToCart,
        handleUpdateQuantity,
        handleRemove,
        contextHolder
    };
};
