package com.nightout.backend.dto;

public record SavedEventDto(
        Long userId,
        Long eventId,
        boolean saved,
        EventSummaryDto event
) {
}
