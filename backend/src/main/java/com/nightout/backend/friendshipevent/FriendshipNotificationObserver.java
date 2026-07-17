package com.nightout.backend.friendshipevent;

import com.nightout.backend.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class FriendshipNotificationObserver {

    private final NotificationService notificationService;

    public FriendshipNotificationObserver(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleFriendshipNotification(
            FriendshipNotificationEvent event
    ) {
        notificationService.createNotification(
                event.getUser(),
                event.getType(),
                event.getMessage()
        );
    }
}