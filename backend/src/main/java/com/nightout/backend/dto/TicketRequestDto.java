package com.nightout.backend.dto;

import jakarta.validation.constraints.NotNull;

public record TicketRequestDto(
        @NotNull Long userId,
        @NotNull Long eventId,
        String ticketType,
        String salesChannel,
        String promoCode
) {
}