package com.example.backend.service;

import com.example.backend.dto.CartDTO;
import com.example.backend.dto.CartItemDTO;
import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;

import java.util.List;

public interface OrderService {
    List<OrderDTO> getAll();

    List<OrderDTO> getByUserId(Long userId);

    List<OrderItemDTO> getOrderItems(Long orderId);

    OrderDTO createOrder(OrderDTO orderDTO, PaymentMethod method, PaymentStatus initialStatus);

    String createOrderWithPayPal(OrderDTO orderDTO);

    String createQR(OrderDTO orderDTO);

    void update(OrderDTO orderDTO, Long id);

    void cancel(Long id);
}
