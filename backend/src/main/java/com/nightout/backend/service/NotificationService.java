package com.nightout.backend.service;

import com.nightout.backend.dto.NotificationDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.NotificationType;
import com.nightout.backend.entity.UserNotification;
import com.nightout.backend.mediator.NotificationDataMediator;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationDataMediator notificationDataMediator;

    private final NightOutMapper mapper;

    public NotificationService(
            NotificationDataMediator notificationDataMediator,
            NightOutMapper mapper
    ) {
        this.notificationDataMediator =
                notificationDataMediator;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(
            Long userId
    ) {
        return notificationDataMediator
                .findNotificationsForUser(userId)
                .stream()
                .map(mapper::toNotificationDto)
                .toList();
    }

    @Transactional
    public NotificationDto createNotification(
            AppUser user,
            NotificationType type,
            String message
    ) {
        UserNotification notification =
                new UserNotification(
                        user,
                        type,
                        message,
                        false,
                        LocalDateTime.now()
                );

        UserNotification savedNotification =
                notificationDataMediator
                        .saveNotification(
                                notification
                        );

        return mapper.toNotificationDto(
                savedNotification
        );
    }

    @Transactional
    public NotificationDto markAsRead(
            Long notificationId
    ) {
        UserNotification notification =
                notificationDataMediator
                        .findNotificationById(
                                notificationId
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Notification not found: "
                                                        + notificationId
                                        )
                        );

        notification.setRead(true);

        UserNotification savedNotification =
                notificationDataMediator
                        .saveNotification(
                                notification
                        );

        return mapper.toNotificationDto(
                savedNotification
        );
    }

    @Transactional
    public NotificationDto createNotification(
            Long userId,
            NotificationType type,
            String message
    ) {
        AppUser user =
                notificationDataMediator
                        .findUserById(userId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "User not found: "
                                                        + userId
                                        )
                        );

        return createNotification(
                user,
                type,
                message
        );
    }
}