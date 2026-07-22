package com.nightout.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreatePregameRoomDto(
        @NotBlank String title,
        @NotNull Long eventId,
        @NotNull Long hostId,
        @NotBlank String meetingLocation,
        @NotNull LocalDateTime meetingTime,
        @Min(1) int maxParticipants,
        String description,
        String imageUrl,
        boolean officialPartner
) {
}
