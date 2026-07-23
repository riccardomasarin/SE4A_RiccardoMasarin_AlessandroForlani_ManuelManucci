package com.nightout.backend.controller;

import com.nightout.backend.dto.CreatePaymentMethodRequest;
import com.nightout.backend.dto.PaymentMethodDto;
import com.nightout.backend.service.PaymentMethodService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
        "/api/users/{userId}/payment-methods"
)
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(
            PaymentMethodService paymentMethodService
    ) {
        this.paymentMethodService =
                paymentMethodService;
    }

    @GetMapping
    public List<PaymentMethodDto> getPaymentMethods(
            @PathVariable Long userId
    ) {
        return paymentMethodService
                .getPaymentMethods(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentMethodDto createPaymentMethod(
            @PathVariable Long userId,
            @RequestBody
            CreatePaymentMethodRequest request
    ) {
        return paymentMethodService
                .createPaymentMethod(
                        userId,
                        request
                );
    }

    @PostMapping("/{paymentMethodId}/default")
    public PaymentMethodDto setDefaultPaymentMethod(
            @PathVariable Long userId,
            @PathVariable Long paymentMethodId
    ) {
        return paymentMethodService
                .setDefaultPaymentMethod(
                        userId,
                        paymentMethodId
                );
    }

    @DeleteMapping("/{paymentMethodId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePaymentMethod(
            @PathVariable Long userId,
            @PathVariable Long paymentMethodId
    ) {
        paymentMethodService
                .deletePaymentMethod(
                        userId,
                        paymentMethodId
                );
    }
}