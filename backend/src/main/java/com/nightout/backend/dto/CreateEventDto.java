package com.nightout.backend.dto;

import com.nightout.backend.entity.MusicGenre;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreateEventDto(
        @NotBlank
        String title,

        String description,

        @NotNull
        Long venueId,

        @NotNull
        Long managerId,

        @NotNull
        LocalDateTime startsAt,

        @NotNull
        LocalDateTime endsAt,

        @NotNull
        MusicGenre musicGenre,

        @NotBlank
        String dressCode,

        @NotBlank
        String ageRestriction,

        @NotBlank
        String entryCondition,

        @Min(0)
        double price,

        @Min(0)
        double vipPrice,

        @Min(1)
        int capacity,

        String imageUrl
) {

    @AssertTrue(
            message =
                    "Event end time must be after start time."
    )
    public boolean isEndTimeValid() {
        if (
                startsAt == null
                        || endsAt == null
        ) {
            return true;
        }

        return endsAt.isAfter(
                startsAt
        );
    }
}