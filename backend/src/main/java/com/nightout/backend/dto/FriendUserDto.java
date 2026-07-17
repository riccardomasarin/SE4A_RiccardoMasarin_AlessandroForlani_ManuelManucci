package com.nightout.backend.dto;

public record FriendUserDto(
        Long id,
        String name,
        String city,
        boolean verified,
        String avatarUrl
) {
}