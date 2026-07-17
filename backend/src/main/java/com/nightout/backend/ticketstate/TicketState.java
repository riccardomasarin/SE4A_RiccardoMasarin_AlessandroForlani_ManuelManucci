package com.nightout.backend.ticketstate;

import com.nightout.backend.entity.Ticket;

public interface TicketState {

    void confirm(Ticket ticket);

    void moveToWaitingList(Ticket ticket);

    void cancel(Ticket ticket);

    void expire(Ticket ticket);
}