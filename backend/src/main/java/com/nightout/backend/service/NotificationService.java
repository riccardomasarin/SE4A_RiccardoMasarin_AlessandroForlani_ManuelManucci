package com.nightout.backend.service;

import com.nightout.backend.dto.NotificationDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.NotificationType;
import com.nightout.backend.entity.UserNotification;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.UserNotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final UserNotificationRepository notificationRepository;
    private final AppUserRepository userRepository;
    private final NightOutMapper mapper;

    public NotificationService(UserNotificationRepository notificationRepository, AppUserRepository userRepository,
            NightOutMapper mapper) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toNotificationDto)
                .toList();
    }

    @Transactional
    public NotificationDto createNotification(AppUser user, NotificationType type, String message) {
        UserNotification notification = new UserNotification(user, type, message, false, LocalDateTime.now());
        return mapper.toNotificationDto(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId) {
        UserNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));
        notification.setRead(true);
        return mapper.toNotificationDto(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationDto createNotification(Long userId, NotificationType type, String message) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        return createNotification(user, type, message);
    }
}
