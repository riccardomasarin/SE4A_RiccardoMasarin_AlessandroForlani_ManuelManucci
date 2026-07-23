package com.nightout.backend.dto;

import com.nightout.backend.entity.NotificationType;
import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        NotificationType type,
        String message,
        boolean read,
        LocalDateTime createdAt
) {
}
