package com.nightout.backend.dto;

import com.nightout.backend.entity.PromotionType;
import java.time.LocalDateTime;

public record PromotionDto(
        Long id,
        Long venueId,
        String venueName,
        Long eventId,
        String eventTitle,
        String label,
        String description,
        PromotionType type,
        String promoCode,
        Integer discountPercentage,
        boolean active,
        LocalDateTime validFrom,
        LocalDateTime validTo
) {

    /*
     * Costruttore compatibile con il vecchio PromotionDto.
     * Evita errori nei punti del progetto che utilizzano ancora
     * solamente id, label, description e date di validità.
     */
    public PromotionDto(
            Long id,
            String label,
            String description,
            LocalDateTime validFrom,
            LocalDateTime validTo
    ) {
        this(
                id,
                null,
                null,
                null,
                null,
                label,
                description,
                PromotionType.SPECIAL_OFFER,
                null,
                null,
                true,
                validFrom,
                validTo
        );
    }
}