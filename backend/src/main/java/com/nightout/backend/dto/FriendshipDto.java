package com.nightout.backend.dto;

import com.nightout.backend.entity.FriendshipStatus;
import java.time.LocalDateTime;

public record FriendshipDto(
        Long id,
        FriendUserDto sender,
        FriendUserDto receiver,
        FriendshipStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}