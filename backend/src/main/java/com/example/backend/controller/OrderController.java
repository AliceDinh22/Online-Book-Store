package com.example.backend.controller;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.ResponseDTO;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseDTO<List<OrderDTO>> getAllOrders() {
        return ResponseDTO.<List<OrderDTO>>builder()
                .data(orderService.getAll())
                .status(200)
                .message("Lấy tất cả đơn hàng thành công!")
                .build();
    }

    @GetMapping("/user/{userId}")
    public ResponseDTO<List<OrderDTO>> getOrdersByUser(@PathVariable Long userId) {
        List<OrderDTO> orders = orderService.getByUserId(userId);
        return ResponseDTO.<List<OrderDTO>>builder()
                .data(orders)
                .status(200)
                .message("Lấy danh sách đơn hàng của user thành công!")
                .build();
    }

    @GetMapping("/{orderId}/items")
    public ResponseDTO<List<OrderItemDTO>> getOrderItems(@PathVariable Long orderId) {
        return ResponseDTO.<List<OrderItemDTO>>builder()
                .data(orderService.getOrderItems(orderId))
                .status(200)
                .message("Lấy danh sách sản phẩm trong đơn hàng thành công!")
                .build();
    }

    @PostMapping("/COD")
    public ResponseDTO<Void> createOrderCOD(@RequestBody @Valid OrderDTO orderDTO) {
        try {
            orderService.createOrder(orderDTO, PaymentMethod.COD, PaymentStatus.PENDING);
            return ResponseDTO.<Void>builder()
                    .status(201)
                    .message("Tạo đơn hàng thành công!")
                    .build();
        } catch (RuntimeException e) {
            return ResponseDTO.<Void>builder()
                    .status(400)
                    .message("Tạo đơn hàng thất bại: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/QR")
    public ResponseDTO<Void> createOrderQR(@RequestBody @Valid OrderDTO orderDTO) {
        try {
            orderService.createOrder(orderDTO, PaymentMethod.QR, PaymentStatus.COMPLETED);
            return ResponseDTO.<Void>builder()
                    .status(201)
                    .message("Tạo đơn hàng thành công!")
                    .build();
        } catch (RuntimeException e) {
            return ResponseDTO.<Void>builder()
                    .status(400)
                    .message("Tạo đơn hàng thất bại: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/paypal")
    public ResponseDTO<String> createOrderWithPayPal(@RequestBody @Valid OrderDTO orderDTO) {
        try {
            return ResponseDTO.<String>builder()
                    .status(201)
                    .message("Tạo đơn hàng thành công! Vui lòng thanh toán PayPal")
                    .data(orderService.createOrderWithPayPal(orderDTO))
                    .build();
        } catch (RuntimeException e) {
            return ResponseDTO.<String>builder()
                    .status(400)
                    .message("Tạo đơn hàng thất bại: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/sepay")
    public ResponseDTO<String> createOrderWithSePay(@RequestBody @Valid OrderDTO orderDTO) {
        try {
            return ResponseDTO.<String>builder()
                    .status(201)
                    .message("Tạo đơn hàng thành công! Vui lòng thanh toán SePay (QR Code)")
                    .data(orderService.createQR(orderDTO))
                    .build();
        } catch (RuntimeException e) {
            return ResponseDTO.<String>builder()
                    .status(400)
                    .message("Tạo đơn hàng thất bại: " + e.getMessage())
                    .build();
        }
    }

    @PutMapping("/{id}/update")
    public ResponseDTO<Void> update(@PathVariable Long id, @RequestBody OrderDTO orderDTO) {
        try {
            orderService.update(orderDTO, id);
            return ResponseDTO.<Void>builder()
                    .status(200)
                    .message("Cập nhật đơn hàng thành công!")
                    .build();
        } catch (RuntimeException e) {
            return ResponseDTO.<Void>builder()
                    .status(400)
                    .message("Cập nhật đơn hàng thất bại: " + e.getMessage())
                    .build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseDTO<Void> cancel(@PathVariable Long id) {
        try {
            orderService.cancel(id);
            return ResponseDTO.<Void>builder()
                    .status(200)
                    .message("Hủy đơn hàng thành công!")
                    .build();
        } catch (RuntimeException e) {
            return ResponseDTO.<Void>builder()
                    .status(400)
                    .message("Hủy đơn hàng thất bại: " + e.getMessage())
                    .build();
        }
    }
}
