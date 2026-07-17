package com.nightout.backend.dto;

import com.nightout.backend.entity.PromotionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreatePromotionDto(
        @NotNull Long venueId,
        @NotNull Long managerId,
        Long eventId,
        @NotBlank String label,
        String description,
        @NotNull PromotionType type,
        String promoCode,
        @Min(0) @Max(100) Integer discountPercentage,
        Boolean active,
        LocalDateTime validFrom,
        LocalDateTime validTo
) {
}