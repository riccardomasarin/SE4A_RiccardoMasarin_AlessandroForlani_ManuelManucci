package com.nightout.backend.dto;

import java.util.List;

public record ManagerDashboardDto(
        Long managerId,
        String managerName,
        Long selectedEventId,
        String selectedEventTitle,
        String venueName,
        int totalTickets,
        int totalTables,
        int totalPregames,
        double todayRevenue,
        int checkinRate,
        List<SalesChannelDto> salesChannels,
        List<String> insightCards,
        List<EventSummaryDto> managedEvents
) {
}
