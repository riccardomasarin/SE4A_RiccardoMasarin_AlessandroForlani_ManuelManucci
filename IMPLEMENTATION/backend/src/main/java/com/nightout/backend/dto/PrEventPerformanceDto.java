package com.nightout.backend.dto;

import java.time.LocalDateTime;

public record PrEventPerformanceDto(
        Long assignmentId,
        Long eventId,
        String eventTitle,
        String venueName,
        LocalDateTime eventStartsAt,
        String promoCode,
        double discountPercentage,
        double commissionPerTicket,
        boolean active,
        long ticketsSold,
        long confirmedTickets,
        long cancelledTickets,
        long waitingListTickets,
        long checkins,
        double revenue,
        double commissionEarned
) {
}