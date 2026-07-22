package com.nightout.backend.dto;

import java.util.List;

public record ProfileDto(
        UserDto user,
        long attendedNights,
        long activeTickets,
        long hostedPregames,
        List<EventSummaryDto> savedEvents,
        List<TicketDto> tickets,
        List<NotificationDto> notifications
) {
}
