package com.nightout.backend.dto;

import com.nightout.backend.entity.VenueCategory;

public record VenueDto(
        Long id,
        String name,
        VenueCategory category,
        String address,
        String city,
        String area,
        String description,
        boolean partnerBar,
        double rating,
        String imageUrl
) {
}
