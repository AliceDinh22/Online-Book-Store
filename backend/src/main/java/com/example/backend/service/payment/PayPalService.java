package com.example.backend.service.payment;

import com.example.backend.dto.payment.PayPalDTO;
import com.example.backend.dto.payment.PayPalPaymentResponse;
import com.example.backend.entity.OrderItem;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.service.email.EmailService;
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class PayPalService {
    private final APIContext apiContext;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    public PayPalPaymentResponse createPaymentPayPal(PayPalDTO payPalDTO, String cancelUrl, String successUrl) throws PayPalRESTException {
        Amount amount = new Amount();
        amount.setTotal(payPalDTO.getAmount().toString());
        amount.setCurrency(payPalDTO.getCurrency());

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setDescription(payPalDTO.getDescription());

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(Arrays.asList(transaction));

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        Payment createdPayment = payment.create(apiContext);

        String approvalUrl = null;
        for (Links link : createdPayment.getLinks()) {
            if ("approval_url".equalsIgnoreCase(link.getRel())) {
                approvalUrl = link.getHref();
                break;
            }
        }

        if (approvalUrl == null) {
            throw new PayPalRESTException("Approval URL not found");
        }

        return new PayPalPaymentResponse(approvalUrl, createdPayment.getId());
    }

    @Transactional
    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException, MessagingException {
        com.example.backend.entity.Payment entity = paymentRepository.findByTransactionId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Payment paypalPayment = new Payment();
        paypalPayment.setId(paymentId);

        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);

        Payment executedPayment = paypalPayment.execute(apiContext, paymentExecution);

        entity.setStatus(PaymentStatus.COMPLETED);
        entity.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(entity);

        com.example.backend.entity.Order order = entity.getOrder();
        order.setStatus(OrderStatus.PROCESSING);
        orderRepository.save(order);

        String htmlContent = buildOrderEmailContent(order, PaymentStatus.COMPLETED);
        emailService.sendEmailWithHtml(order.getUser().getEmail(),
                "Thanh toán thành công!",
                htmlContent);

        return executedPayment;
    }

    @Transactional
    public void cancelPayment(String paymentId) throws MessagingException {
        com.example.backend.entity.Payment entity = paymentRepository.findByTransactionId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        entity.setStatus(PaymentStatus.FAILED);
        entity.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(entity);

        com.example.backend.entity.Order order = entity.getOrder();
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);

        String htmlContent = buildOrderEmailContent(order, PaymentStatus.FAILED);
        emailService.sendEmailWithHtml(order.getUser().getEmail(),
                "Thanh toán thất bại",
                htmlContent);
    }

    private String buildOrderEmailContent(com.example.backend.entity.Order order, PaymentStatus status) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>Xin chào ").append(order.getUser().getFirstName()).append("</h2>");

        if (status == PaymentStatus.COMPLETED) {
            sb.append("<p>Đơn hàng của bạn đã được <b>thanh toán thành công</b>!</p>");
        } else if (status == PaymentStatus.FAILED) {
            sb.append("<p>Rất tiếc, thanh toán cho đơn hàng <b>#")
                    .append(order.getId())
                    .append("</b> đã <b>thất bại</b>.</p>");
        } else {
            sb.append("<p>Đơn hàng của bạn đang ở trạng thái: <b>")
                    .append(status.name())
                    .append("</b></p>");
        }

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
                    .append(" - Giá: ").append(item.getPrice())
                    .append("</li>");
        }
        sb.append("</ul>");

        sb.append("<p><b>Tổng tiền:</b> ").append(order.getTotalPrice()).append("</p>");

        if (status == PaymentStatus.COMPLETED) {
            sb.append("<p>Cảm ơn bạn đã mua hàng!</p>");
        } else if (status == PaymentStatus.FAILED) {
            sb.append("<p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>");
        }

        return sb.toString();
    }
}
