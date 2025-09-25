import axiosClient from "./axiosClient";
import { OrderDTO, OrderItemDTO } from "../types/types";

export const getAllOrders = async (): Promise<OrderDTO[]> => {
  const res = await axiosClient.get("/orders");
  return res.data.data;
};

export const getOrdersByUser = async (userId: number): Promise<OrderDTO[]> => {
  const res = await axiosClient.get(`/orders/user/${userId}`);
  return res.data.data;
};

export const getOrderItems = async (orderId: number): Promise<OrderItemDTO[]> => {
  const res = await axiosClient.get(`/orders/${orderId}/items`);
  return res.data.data;
};

export const updateOrder = async (order: OrderDTO, orderId: number) => {
  const res = await axiosClient.put(`/orders/${orderId}/update`, order);
  return res.data;
};
