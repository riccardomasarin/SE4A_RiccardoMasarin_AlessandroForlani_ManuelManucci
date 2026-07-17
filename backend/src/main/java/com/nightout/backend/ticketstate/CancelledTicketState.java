package com.nightout.backend.ticketstate;

import com.nightout.backend.entity.Ticket;

public class CancelledTicketState implements TicketState {

    @Override
    public void confirm(Ticket ticket) {
        throw new IllegalStateException(
                "A cancelled ticket cannot be confirmed."
        );
    }

    @Override
    public void moveToWaitingList(Ticket ticket) {
        throw new IllegalStateException(
                "A cancelled ticket cannot be moved to the waiting list."
        );
    }

    @Override
    public void cancel(Ticket ticket) {
        throw new IllegalStateException(
                "Ticket is already cancelled."
        );
    }

    @Override
    public void expire(Ticket ticket) {
        throw new IllegalStateException(
                "A cancelled ticket cannot expire."
        );
    }
}