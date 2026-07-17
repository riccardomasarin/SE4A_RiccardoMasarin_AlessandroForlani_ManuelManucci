package com.nightout.backend.dto;

import java.time.LocalDateTime;

public record SupportRequestDto(
        Long id,
        Long userId,
        String category,
        String subject,
        String message,
        String status,
        LocalDateTime createdAt
) {
}