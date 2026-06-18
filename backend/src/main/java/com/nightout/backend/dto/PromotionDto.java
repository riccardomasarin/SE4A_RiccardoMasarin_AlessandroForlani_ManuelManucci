package com.nightout.backend.dto;

import java.time.LocalDateTime;

public record PromotionDto(
        Long id,
        String label,
        String description,
        LocalDateTime validFrom,
        LocalDateTime validTo
) {
}
