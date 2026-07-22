package com.nightout.backend.dto;

public record CreatePaymentMethodRequest(
        String cardholderName,
        String brand,
        String lastFourDigits,
        int expiryMonth,
        int expiryYear,
        boolean defaultMethod
) {
}