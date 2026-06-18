package com.nightout.backend.controller;

import com.nightout.backend.dto.NotificationDto;
import com.nightout.backend.service.NotificationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/users/{userId}/notifications")
    public List<NotificationDto> getNotifications(@PathVariable Long userId) {
        return notificationService.getNotifications(userId);
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public NotificationDto markAsRead(@PathVariable Long notificationId) {
        return notificationService.markAsRead(notificationId);
    }
}
