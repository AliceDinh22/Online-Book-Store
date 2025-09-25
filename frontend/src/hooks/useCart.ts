import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { BookDTO, CartItemDTO } from "../types/types";
import { message } from "antd";

const LOCAL_CART_KEY = "guest_cart";

export const useCart = (userId?: number) => {
    const [cart, setCart] = useState<CartItemDTO[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    // Lấy giỏ hàng guest từ localStorage
    const getLocalCart = (): CartItemDTO[] => {
        const data = localStorage.getItem(LOCAL_CART_KEY);
        return data ? JSON.parse(data) : [];
    };

    const saveLocalCart = (items: CartItemDTO[]) => {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
        setCart(items);
    };

    // Lấy giỏ hàng server hoặc local tùy user
    const fetchCart = async () => {
        if (userId) {
            try {
                const res = await axiosClient.get(`/cart?userId=${userId}`);
                const serverCart: CartItemDTO[] = res.data.data?.items || [];

                // Lấy giỏ hàng guest từ localStorage
                const guestCart = getLocalCart();
                if (guestCart.length > 0) {
                    const mergedCart = [...serverCart];

                    guestCart.forEach((guestItem) => {
                        const idx = mergedCart.findIndex((item) => item.book.id === guestItem.book.id);
                        if (idx !== -1) {
                            mergedCart[idx].quantity += guestItem.quantity;
                        } else {
                            mergedCart.push(guestItem);
                        }
                    });

                    // Gửi merged cart lên server dưới dạng { items: [...] }
                    await axiosClient.post(`/cart/merge?userId=${userId}`, mergedCart);

                    // Xóa localStorage guest cart
                    localStorage.removeItem(LOCAL_CART_KEY);

                    // Cập nhật state
                    setCart(mergedCart);
                    return;
                }

                setCart(serverCart);
            } catch {
                messageApi.error("Lấy giỏ hàng thất bại!");
            }
        } else {
            // Guest
            setCart(getLocalCart());
        }
    };

    // Thêm vào giỏ hàng
    const addToCart = async (book: BookDTO, quantity: number) => {
        const maxQuantity = (book.stock ?? 0) - (book.sold ?? 0);
        const existing = cart.find((item) => item.book.id === book.id);
        const newQuantity = existing ? existing.quantity + quantity : quantity;

        if (newQuantity > maxQuantity) {
            messageApi.warning("Số lượng trong giỏ không được vượt quá tồn kho");
            return;
        }

        if (userId) {
            try {
                await axiosClient.post(`/cart/add?userId=${userId}&bookId=${book.id}&quantity=${quantity}`);
                messageApi.success(`${book.title} đã được thêm vào giỏ hàng!`);
                fetchCart();
            } catch {
                messageApi.error("Thêm vào giỏ hàng thất bại");
            }
        } else {
            // Guest
            const localCart = getLocalCart();
            const idx = localCart.findIndex((item) => item.book.id === book.id);
            if (idx !== -1) localCart[idx].quantity += quantity;
            else localCart.push({ book, quantity });
            saveLocalCart(localCart);
            messageApi.success(`${book.title} đã được thêm vào giỏ hàng!`);
        }
    };

    // Cập nhật số lượng
    const handleUpdateQuantity = async (bookId: number, delta: number) => {
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

        if (userId) {
            try {
                await axiosClient.put("/cart/update", null, {
                    params: { userId, bookId, newQuantity }
                });
            } catch {
                messageApi.error("Cập nhật giỏ hàng thất bại");
                fetchCart();
            }
        } else {
            // Guest
            const localCart = getLocalCart();
            const idx = localCart.findIndex((item) => item.book.id === bookId);
            if (idx !== -1) {
                localCart[idx].quantity = newQuantity;
                saveLocalCart(localCart);
            }
        }
    };

    // Xóa sản phẩm
    const handleRemove = async (bookId: number) => {
        if (userId) {
            try {
                await axiosClient.delete("/cart/remove", { params: { userId, bookId } });
                fetchCart();
            } catch {
                messageApi.error("Xóa sản phẩm thất bại");
            }
        } else {
            const localCart = getLocalCart().filter((item) => item.book.id !== bookId);
            saveLocalCart(localCart);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [userId]);

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
