package com.nightout.backend.ticketstate;

import com.nightout.backend.entity.TicketStatus;

public final class TicketStateFactory {

    private TicketStateFactory() {
    }

    public static TicketState from(
            TicketStatus status
    ) {
        if (status == null) {
            throw new IllegalArgumentException(
                    "Ticket status cannot be null."
            );
        }

        return switch (status) {
            case PENDING ->
                    new PendingTicketState();

            case CONFIRMED ->
                    new ConfirmedTicketState();

            case WAITING_LIST ->
                    new WaitingListTicketState();

            case CANCELLED ->
                    new CancelledTicketState();

            case EXPIRED ->
                    new ExpiredTicketState();
        };
    }
}