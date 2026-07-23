package com.nightout.backend.dto;

public record CreateSupportRequestRequest(
        String category,
        String subject,
        String message
) {
}