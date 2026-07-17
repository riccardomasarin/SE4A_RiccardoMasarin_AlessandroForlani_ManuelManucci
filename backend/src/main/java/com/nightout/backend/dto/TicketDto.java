package com.nightout.backend.dto;

import com.nightout.backend.entity.TicketStatus;
import java.time.LocalDateTime;

public record TicketDto(
        Long id,
        String code,
        Long userId,
        String userName,
        Long eventId,
        String eventTitle,
        String venueName,
        String venueAddress,
        LocalDateTime eventStartsAt,
        TicketStatus status,
        String ticketType,
        double pricePaid,
        LocalDateTime createdAt,
        String salesChannel,
        String qrPayload,
        Long prId,
        String prName,
        String promoCodeUsed,
        double discountAmount,
        double commissionAmount,
        LocalDateTime checkedInAt,
        boolean checkedIn
) {
}