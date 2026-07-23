package com.nightout.backend;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.ticketstate.CancelledTicketState;
import com.nightout.backend.ticketstate.ConfirmedTicketState;
import com.nightout.backend.ticketstate.ExpiredTicketState;
import com.nightout.backend.ticketstate.PendingTicketState;
import com.nightout.backend.ticketstate.TicketState;
import com.nightout.backend.ticketstate.TicketStateFactory;
import com.nightout.backend.ticketstate.WaitingListTicketState;
import org.junit.jupiter.api.Test;

class TicketStateFactoryTests {

    @Test
    void pendingStatusCreatesPendingState() {
        TicketState state =
                TicketStateFactory.from(
                        TicketStatus.PENDING
                );

        assertInstanceOf(
                PendingTicketState.class,
                state
        );
    }

    @Test
    void confirmedStatusCreatesConfirmedState() {
        TicketState state =
                TicketStateFactory.from(
                        TicketStatus.CONFIRMED
                );

        assertInstanceOf(
                ConfirmedTicketState.class,
                state
        );
    }

    @Test
    void waitingListStatusCreatesWaitingListState() {
        TicketState state =
                TicketStateFactory.from(
                        TicketStatus.WAITING_LIST
                );

        assertInstanceOf(
                WaitingListTicketState.class,
                state
        );
    }

    @Test
    void cancelledStatusCreatesCancelledState() {
        TicketState state =
                TicketStateFactory.from(
                        TicketStatus.CANCELLED
                );

        assertInstanceOf(
                CancelledTicketState.class,
                state
        );
    }

    @Test
    void expiredStatusCreatesExpiredState() {
        TicketState state =
                TicketStateFactory.from(
                        TicketStatus.EXPIRED
                );

        assertInstanceOf(
                ExpiredTicketState.class,
                state
        );
    }

    @Test
    void nullStatusIsRejected() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        TicketStateFactory.from(
                                null
                        )
        );
    }
}