package com.nightout.backend.dto;

import com.nightout.backend.entity.MusicGenre;
import java.time.LocalDateTime;
import java.util.List;

public record EventSummaryDto(
        Long id,
        String title,
        String venueName,
        String city,
        String area,
        LocalDateTime startsAt,
        MusicGenre musicGenre,
        String entryCondition,
        double price,
        int capacity,
        long confirmedTickets,
        int availableSpots,
        int popularityScore,
        boolean featured,
        String imageUrl,
        List<String> promotionLabels
) {
}
