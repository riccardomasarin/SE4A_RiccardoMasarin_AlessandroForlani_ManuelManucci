package com.nightout.backend.dto;

public record LoginResponseDto(
        boolean authenticated,
        Long profileId,
        String displayName,
        String email,
        String role
) {
}
