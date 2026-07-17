package com.nightout.backend.ticketstate;

import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;

public class PendingTicketState implements TicketState {

    @Override
    public void confirm(Ticket ticket) {
        ticket.changeStatus(
                TicketStatus.CONFIRMED
        );
    }

    @Override
    public void moveToWaitingList(Ticket ticket) {
        ticket.changeStatus(
                TicketStatus.WAITING_LIST
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