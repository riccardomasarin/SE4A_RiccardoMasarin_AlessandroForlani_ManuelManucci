package com.nightout.backend.dto;

import java.time.LocalDateTime;

public record ReturnTransportDto(
        Long id,
        String provider,
        String label,
        LocalDateTime pickupTime,
        String pickupPoint,
        String destinationArea,
        double price,
        String status
) {
}
