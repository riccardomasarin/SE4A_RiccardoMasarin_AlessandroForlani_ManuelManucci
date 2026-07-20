package com.nightout.backend.dto;

import com.nightout.backend.entity.MusicGenre;
import java.time.LocalDateTime;
import java.util.List;

public record EventDetailDto(
        Long id,
        String title,
        String description,
        VenueDto venue,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        MusicGenre musicGenre,
        String dressCode,
        String ageRestriction,
        String entryCondition,
        double price,
        double vipPrice,
        int capacity,
        long confirmedTickets,
        int availableSpots,
        Double distanceKm,
        int popularityScore,
        int atmosphereScore,
        int musicScore,
        int drinkScore,
        int lineScore,
        boolean featured,
        String imageUrl,
        List<PromotionDto> promotions,
        List<PregameRoomDto> pregames,
        List<ReturnTransportDto> returnTransport
) {
}