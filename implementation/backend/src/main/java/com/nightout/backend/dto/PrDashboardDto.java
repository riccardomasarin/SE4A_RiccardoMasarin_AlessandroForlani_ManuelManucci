package com.nightout.backend.dto;

import java.util.List;

public record PrDashboardDto(
        Long prId,
        String prName,
        long totalTicketsSold,
        long confirmedTickets,
        long cancelledTickets,
        long waitingListTickets,
        long totalCheckins,
        double totalRevenue,
        double totalCommissionEarned,
        PrEventPerformanceDto currentEvent,
        List<PrEventPerformanceDto> eventPerformance
) {
}