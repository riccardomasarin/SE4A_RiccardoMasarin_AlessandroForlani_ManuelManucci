package com.nightout.backend.dto;

import java.util.Set;

public record UpdateProfileRequest(
        String name,
        String email,
        String city,
        Set<String> musicPreferences
) {
}