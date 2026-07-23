package com.nightout.backend.dto;

public record SalesChannelDto(
        Long id,
        String name,
        String channelType,
        int ticketCount,
        int tableCount,
        double revenue,
        int checkins,
        String promoLabel
) {
}
