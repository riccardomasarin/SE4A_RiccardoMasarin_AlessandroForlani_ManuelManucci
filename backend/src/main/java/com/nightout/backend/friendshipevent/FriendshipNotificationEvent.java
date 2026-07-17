package com.nightout.backend.friendshipevent;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.NotificationType;

public class FriendshipNotificationEvent {

    private final AppUser user;
    private final NotificationType type;
    private final String message;

    public FriendshipNotificationEvent(
            AppUser user,
            NotificationType type,
            String message
    ) {
        if (user == null) {
            throw new IllegalArgumentException("Notification user cannot be null.");
        }

        if (type == null) {
            throw new IllegalArgumentException("Notification type cannot be null.");
        }

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Notification message cannot be empty.");
        }

        this.user = user;
        this.type = type;
        this.message = message;
    }

    public AppUser getUser() {
        return user;
    }

    public NotificationType getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }
}