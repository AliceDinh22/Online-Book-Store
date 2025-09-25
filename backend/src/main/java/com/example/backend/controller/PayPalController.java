package com.example.backend.controller;

import com.example.backend.dto.ResponseDTO;
import com.example.backend.service.payment.PayPalService;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/paypal")
@RequiredArgsConstructor
public class PayPalController {
    private final PayPalService payPalService;

    @GetMapping("/success")
    public void success(@RequestParam("paymentId") String paymentId,
                        @RequestParam("PayerID") String payerId,
                        HttpServletResponse response) throws IOException {
        try {
            Payment executedPayment = payPalService.executePayment(paymentId, payerId);
            response.sendRedirect("http://localhost:3000/paypal/result?status=success&paymentId=" + executedPayment.getId());
        } catch (PayPalRESTException e) {
            e.printStackTrace();
            response.sendRedirect("http://localhost:3000/paypal/result?status=failed&message=" + e.getMessage());
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/cancel")
    public void cancel(@RequestParam("paymentId") String paymentId,
                       HttpServletResponse response) throws IOException, MessagingException {
        try {
            payPalService.cancelPayment(paymentId);
            response.sendRedirect("http://localhost:3000/paypal/result?status=cancel&paymentId=" + paymentId);
        } catch (RuntimeException e) {
            response.sendRedirect("http://localhost:3000/paypal/result?status=failed&message=" + e.getMessage());
        }
    }
}
