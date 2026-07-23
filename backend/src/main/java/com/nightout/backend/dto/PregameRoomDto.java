package com.nightout.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PregameRoomDto(
        Long id,
        String title,
        Long eventId,
        String eventTitle,
        Long hostId,
        String hostName,
        String meetingLocation,
        LocalDateTime meetingTime,
        int maxParticipants,
        int currentParticipants,
        String description,
        String imageUrl,
        boolean officialPartner,
        List<UserDto> participants
) {
}
