package com.nightout.backend.ticketevent;

import com.nightout.backend.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class TicketNotificationObserver {

    private final NotificationService notificationService;

    public TicketNotificationObserver(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleTicketNotification(
            TicketNotificationEvent event
    ) {
        notificationService.createNotification(
                event.getUser(),
                event.getType(),
                event.getMessage()
        );
    }
}