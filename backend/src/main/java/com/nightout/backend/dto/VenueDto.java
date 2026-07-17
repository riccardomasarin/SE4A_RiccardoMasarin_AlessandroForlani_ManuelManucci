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
        String imageUrl,
        String phoneNumber,
        String contactEmail,
        String websiteUrl,
        String instagramUrl,
        String facebookUrl,
        String tiktokUrl
) {

    /*
     * Costruttore compatibile con il vecchio VenueDto.
     * I nuovi campi vengono inizialmente impostati a null.
     */
    public VenueDto(
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
        this(
                id,
                name,
                category,
                address,
                city,
                area,
                description,
                partnerBar,
                rating,
                imageUrl,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}