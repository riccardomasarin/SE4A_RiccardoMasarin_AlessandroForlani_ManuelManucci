package com.nightout.backend.dto;

import com.nightout.backend.entity.UserRole;
import java.util.List;

public record UserDto(
        Long id,
        String name,
        String email,
        UserRole role,
        String city,
        boolean verified,
        int points,
        String avatarUrl,
        List<String> musicPreferences
) {
}
