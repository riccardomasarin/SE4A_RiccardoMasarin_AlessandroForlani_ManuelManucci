package com.nightout.backend.dto;

import java.time.LocalDateTime;

public record PaymentMethodDto(
        Long id,
        Long userId,
        String cardholderName,
        String brand,
        String lastFourDigits,
        int expiryMonth,
        int expiryYear,
        boolean defaultMethod,
        LocalDateTime createdAt
) {
}