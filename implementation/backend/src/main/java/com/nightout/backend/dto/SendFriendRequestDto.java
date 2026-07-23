package com.nightout.backend.dto;

public record SendFriendRequestDto(
        Long senderId,
        Long receiverId
) {
}