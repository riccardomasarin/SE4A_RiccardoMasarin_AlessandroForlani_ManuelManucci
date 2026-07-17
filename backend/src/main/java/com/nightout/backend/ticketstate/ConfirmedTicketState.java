package com.nightout.backend.ticketstate;

import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;

public class ConfirmedTicketState implements TicketState {

    @Override
    public void confirm(Ticket ticket) {
        throw new IllegalStateException(
                "Ticket is already confirmed."
        );
    }

    @Override
    public void moveToWaitingList(Ticket ticket) {
        throw new IllegalStateException(
                "A confirmed ticket cannot return to the waiting list."
        );
    }

    @Override
    public void cancel(Ticket ticket) {
        ticket.changeStatus(
                TicketStatus.CANCELLED
        );
    }

    @Override
    public void expire(Ticket ticket) {
        ticket.changeStatus(
                TicketStatus.EXPIRED
        );
    }
}