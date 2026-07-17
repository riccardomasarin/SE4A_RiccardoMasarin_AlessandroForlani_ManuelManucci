package com.nightout.backend.dto;

import com.nightout.backend.entity.MusicGenre;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record UpdateEventDto(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull Long venueId,
        @NotNull Long managerId,
        @NotNull LocalDateTime startsAt,
        @NotNull MusicGenre musicGenre,
        @NotBlank String dressCode,
        @NotBlank String ageRestriction,
        @NotBlank String entryCondition,
        @Min(0) double price,
        @Min(0) double vipPrice,
        @Min(1) int capacity,
        @NotBlank String imageUrl
) {
}