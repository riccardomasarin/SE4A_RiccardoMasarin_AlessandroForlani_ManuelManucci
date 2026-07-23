package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.UserNotification;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.UserNotificationRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class NotificationDataMediator {

    private final UserNotificationRepository notificationRepository;

    private final AppUserRepository userRepository;

    public NotificationDataMediator(
            UserNotificationRepository notificationRepository,
            AppUserRepository userRepository
    ) {
        this.notificationRepository =
                notificationRepository;
        this.userRepository =
                userRepository;
    }

    public List<UserNotification> findNotificationsForUser(
            Long userId
    ) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }

    public Optional<UserNotification> findNotificationById(
            Long notificationId
    ) {
        return notificationRepository
                .findById(notificationId);
    }

    public UserNotification saveNotification(
            UserNotification notification
    ) {
        return notificationRepository
                .save(notification);
    }

    public Optional<AppUser> findUserById(
            Long userId
    ) {
        return userRepository.findById(userId);
    }
}