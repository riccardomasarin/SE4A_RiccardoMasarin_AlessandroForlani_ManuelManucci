package com.nightout.backend.dto;

import com.nightout.backend.entity.VenueCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateVenueRequest(
        @NotNull Long managerId,

        @NotBlank
        @Size(max = 120)
        String name,

        @NotNull
        VenueCategory category,

        @NotBlank
        @Size(max = 255)
        String address,

        @NotBlank
        @Size(max = 100)
        String city,

        @NotBlank
        @Size(max = 100)
        String area,

        @Size(max = 2000)
        String description,

        String imageUrl,

        @Size(max = 40)
        String phoneNumber,

        @Email
        @Size(max = 160)
        String contactEmail,

        String websiteUrl,

        String instagramUrl,

        String facebookUrl,

        String tiktokUrl
) {
}