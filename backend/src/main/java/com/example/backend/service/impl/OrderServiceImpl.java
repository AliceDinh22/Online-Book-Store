package com.example.backend.service.impl;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.payment.PayPalDTO;
import com.example.backend.dto.payment.PayPalPaymentResponse;
import com.example.backend.dto.payment.PaymentDTO;
import com.example.backend.dto.payment.sepay.SePayDTO;
import com.example.backend.dto.payment.sepay.SePayPaymentResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.repository.*;
import com.example.backend.service.OrderService;
import com.example.backend.service.email.EmailService;
import com.example.backend.service.payment.PayPalService;
import com.example.backend.service.payment.SePayService;
import com.paypal.base.rest.PayPalRESTException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final PayPalService payPalService;
    private final SePayService sePayService;

    @Override
    public List<OrderDTO> getAll() {
        return mapToDTO(orderRepository.findAll());
    }

    @Override
    public List<OrderDTO> getByUserId(Long userId) {
        return mapToDTO(orderRepository.findAllByUserId(userId));
    }

    @Override
    public List<OrderItemDTO> getOrderItems(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tìm thấy đơn hàng!"));

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElseThrow(() -> new RuntimeException("Payment not found"));

        PaymentDTO paymentDTO = mapToPaymentDTO(payment);

        List<OrderItemDTO> result = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            OrderItemDTO dto = mapToOrderItemDTO(item);
            dto.setPaymentDTO(paymentDTO);
            result.add(dto);
        }
        return result;
    }

    @Override
    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO, PaymentMethod method, PaymentStatus initialStatus) {
        User user = userRepository.findById(orderDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Long> selectedCartItemIds = orderDTO.getCartItemIds();
        List<CartItem> selectedCartItems = cartItemRepository.findAllById(selectedCartItemIds);


        Order savedOrder = orderRepository.save(
                buildOrderFromCart(user, selectedCartItems, orderDTO, method.name())
        );

        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setAmount(savedOrder.getTotalPrice());
        payment.setCurrency("VND");
        payment.setMethod(method);
        payment.setStatus(initialStatus);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setTransactionId(UUID.randomUUID().toString());

        paymentRepository.save(payment);

        try {
            String htmlContent = buildOrderEmailContent(savedOrder);
            emailService.sendEmailWithHtml(
                    user.getEmail(),
                    "Tạo đơn hàng thành công!",
                    htmlContent
            );
        } catch (MessagingException e) {
            e.printStackTrace();
        }

        return mapToDTO(savedOrder);
    }

    @Override
    public String createOrderWithPayPal(OrderDTO orderDTO) {
        try {
            String method = PaymentMethod.PayPal.name();
            User user = userRepository.findById(orderDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<CartItem> selectedCartItems = cartItemRepository.findAllById(orderDTO.getCartItemIds());

            Order savedOrder = orderRepository.save(
                    buildOrderFromCart(user, selectedCartItems, orderDTO, method)
            );

            PayPalDTO payPalDTO = new PayPalDTO();
            payPalDTO.setAmount(savedOrder.getTotalPrice());
            payPalDTO.setCurrency("USD");
            payPalDTO.setDescription("Thanh toan don hang #" + savedOrder.getId());

            String successUrl = "http://localhost:8080/paypal/success";
            String cancelUrl = "http://localhost:8080/paypal/cancel";

            PayPalPaymentResponse response = payPalService.createPaymentPayPal(payPalDTO, cancelUrl, successUrl);

            Payment payment = new Payment();
            payment.setOrder(savedOrder);
            payment.setAmount(payPalDTO.getAmount());
            payment.setCurrency(payPalDTO.getCurrency());
            payment.setMethod(PaymentMethod.PayPal);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setTransactionId(response.getTransactionId());
            payment.setCreatedAt(LocalDateTime.now());

            paymentRepository.save(payment);

            return response.getApprovalUrl();
        } catch (PayPalRESTException e) {
            e.printStackTrace();
            throw new RuntimeException("Tạo payment PayPal thất bại: " + e.getMessage());
        }
    }

    @Override
    public String createQR(OrderDTO orderDTO) {
        try {
            String method = PaymentMethod.QR.name();
            User user = userRepository.findById(orderDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            SePayDTO sePayDTO = new SePayDTO(
                    orderDTO.getTotalPrice(),
                    "VND",
                    "Thanh toan SePay cho don hang #" + orderDTO.getId()
            );

            return sePayService.createPayment(sePayDTO, orderDTO);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Tạo payment SePay thất bại: " + e.getMessage());
        }
    }

    private String buildOrderEmailContent(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>Xin chào ").append(order.getUser().getFirstName()).append("</h2>");
        sb.append("<p>Đơn hàng của bạn đã được tạo thành công!</p>");
        sb.append("<p><b>Mã đơn hàng:</b> ").append(order.getId()).append("</p>");
        sb.append("<p><b>Ngày:</b> ").append(order.getDate()).append("</p>");
        sb.append("<p><b>Địa chỉ giao hàng:</b> ").append(order.getAddress())
                .append(", ").append(order.getCity()).append("</p>");
        sb.append("<h3>Chi tiết sản phẩm:</h3>");
        sb.append("<ul>");
        for (OrderItem item : order.getItems()) {
            sb.append("<li>")
                    .append(item.getBook().getTitle())
                    .append(" - Số lượng: ").append(item.getQuantity())
                    .append(" - Giá: ").append(item.getPrice()).append("</li>");
        }
        sb.append("</ul>");
        sb.append("<p><b>Tổng tiền:</b> ").append(order.getTotalPrice()).append("</p>");
        sb.append("<p>Cảm ơn bạn đã mua hàng!</p>");
        return sb.toString();
    }

    @Override
    public void update(OrderDTO orderDTO, Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        order.setAddress(orderDTO.getAddress());
        order.setCity(orderDTO.getCity());
        order.setPhoneNumber(orderDTO.getPhoneNumber());

        OrderStatus newOrderStatus = OrderStatus.valueOf(orderDTO.getStatus().toUpperCase());
        order.setStatus(newOrderStatus);

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Đồng bộ PaymentStatus dựa theo PaymentMethod
        if (payment.getMethod() == PaymentMethod.COD) {
            switch (newOrderStatus) {
                case PENDING, PROCESSING, SHIPPED -> payment.setStatus(PaymentStatus.PENDING);
                case DELIVERED -> payment.setStatus(PaymentStatus.COMPLETED);
                case CANCELLED, FAILED -> payment.setStatus(PaymentStatus.FAILED);
                case REFUNDED -> payment.setStatus(PaymentStatus.REFUNDED);
            }
        } else if (payment.getMethod() == PaymentMethod.QR) {
            switch (newOrderStatus) {
                case DELIVERED, SHIPPED -> payment.setStatus(PaymentStatus.COMPLETED);
                case CANCELLED, FAILED, REFUNDED -> payment.setStatus(PaymentStatus.REFUNDED);
                default -> payment.setStatus(PaymentStatus.PENDING);
            }
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }


    @Override
    public void cancel(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private OrderDTO mapToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setDate(order.getDate());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setStatus(order.getStatus().name());
        dto.setAddress(order.getAddress());
        dto.setCity(order.getCity());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setUserId(order.getUser().getId());
        dto.setUsername(order.getUser().getFirstName() + " " + order.getUser().getLastName());

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElseThrow(() -> new RuntimeException("Payment not found"));

        PaymentDTO paymentDTO = mapToPaymentDTO(payment);

        dto.setPayment(paymentDTO);

        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            itemDTOs.add(mapToOrderItemDTO(item));
        }
        dto.setItems(itemDTOs);

        return dto;
    }

    private List<OrderDTO> mapToDTO(List<Order> orders) {
        return orders.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private OrderItemDTO mapToOrderItemDTO(OrderItem item) {
        Book book = bookRepository.findById(item.getBook().getId()).orElseThrow(() -> new RuntimeException("Book not found"));

        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setBookId(item.getBook().getId());
        dto.setBookTitle(item.getBook().getTitle());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setBookUrl(book.getCoverImages().toString());
        return dto;
    }

    private PaymentDTO mapToPaymentDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setAmount(payment.getAmount());
        dto.setCurrency(payment.getCurrency());
        dto.setMethod(payment.getMethod().name());
        dto.setStatus(payment.getStatus().name());
        dto.setOrderId(payment.getOrder().getId());
        dto.setTransactionId(payment.getTransactionId());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        return dto;
    }

    private Order buildOrderFromCart(User user, List<CartItem> selectedCartItems, OrderDTO orderDTO, String method) {
        Order order = new Order();
        order.setUser(user);
        order.setDate(LocalDateTime.now());

        if (Objects.equals(method, PaymentMethod.COD.name()))
            order.setStatus(OrderStatus.PENDING);

        if (Objects.equals(method, PaymentMethod.QR.name()))
            order.setStatus(OrderStatus.PROCESSING);

        order.setAddress(orderDTO.getAddress());
        order.setCity(orderDTO.getCity());
        order.setPhoneNumber(orderDTO.getPhoneNumber());

        List<OrderItem> orderDetails = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : selectedCartItems) {
            OrderItem detail = new OrderItem();
            detail.setOrder(order);
            detail.setBook(cartItem.getBook());
            detail.setQuantity(cartItem.getQuantity());
            detail.setPrice(cartItem.getBook().getFinalPrice());

            orderDetails.add(detail);

            total = total.add(cartItem.getBook().getFinalPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            cartItemRepository.delete(cartItem);

            Book book = cartItem.getBook();
            if (book.getSold() == null) {
                book.setSold(cartItem.getQuantity());
            } else {
                book.setSold(book.getSold() + cartItem.getQuantity());
            }
            bookRepository.save(book);
        }
        order.setItems(orderDetails);

        if (Objects.equals(method, PaymentMethod.PayPal.name())) {
            BigDecimal EXCHANGE_RATE = new BigDecimal("25000");
            total = total.divide(EXCHANGE_RATE, 2, RoundingMode.HALF_UP);
        }

        order.setTotalPrice(total);

        return order;
    }

}
