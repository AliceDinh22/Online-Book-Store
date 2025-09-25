package com.example.backend.service.payment;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.payment.sepay.SePayDTO;
import com.example.backend.dto.payment.sepay.SePayPaymentResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.service.email.EmailService;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;


import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SePayService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    @Value("${sepay.bank}")
    private String bank;

    @Value("${sepay.account}")
    private String account;

    @Value("${sepay.template}")
    private String template;

    public String createPayment(SePayDTO sePayDTO, OrderDTO order) {
        String description = sePayDTO.getDescription() != null
                ? sePayDTO.getDescription()
                : "Thanh toan don hang #" + order.getId();

        return String.format(
                "https://qr.sepay.vn/img?bank=%s&acc=%s&template=%s&amount=%s&des=%s",
                bank,
                account,
                template,
                sePayDTO.getAmount(),
                UriUtils.encode(description, StandardCharsets.UTF_8)
        );
    }
}
