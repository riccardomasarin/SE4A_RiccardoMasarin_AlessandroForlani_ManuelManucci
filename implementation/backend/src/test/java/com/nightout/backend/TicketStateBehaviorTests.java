package com.nightout.backend;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.ticketstate.CancelledTicketState;
import com.nightout.backend.ticketstate.ConfirmedTicketState;
import com.nightout.backend.ticketstate.ExpiredTicketState;
import com.nightout.backend.ticketstate.PendingTicketState;
import com.nightout.backend.ticketstate.WaitingListTicketState;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class TicketStateBehaviorTests {

    @Test
    void pendingStateAllowsAllExpectedTransitions() {
        PendingTicketState state =
                new PendingTicketState();

        Ticket confirmedTicket =
                createTicketInState(
                        TicketStatus.PENDING
                );

        Ticket waitingTicket =
                createTicketInState(
                        TicketStatus.PENDING
                );

        Ticket cancelledTicket =
                createTicketInState(
                        TicketStatus.PENDING
                );

        Ticket expiredTicket =
                createTicketInState(
                        TicketStatus.PENDING
                );

        state.confirm(confirmedTicket);
        state.moveToWaitingList(waitingTicket);
        state.cancel(cancelledTicket);
        state.expire(expiredTicket);

        assertAll(
                () -> assertEquals(
                        TicketStatus.CONFIRMED,
                        confirmedTicket.getStatus()
                ),
                () -> assertEquals(
                        TicketStatus.WAITING_LIST,
                        waitingTicket.getStatus()
                ),
                () -> assertEquals(
                        TicketStatus.CANCELLED,
                        cancelledTicket.getStatus()
                ),
                () -> assertEquals(
                        TicketStatus.EXPIRED,
                        expiredTicket.getStatus()
                )
        );
    }

    @Test
    void confirmedStateAllowsCancelAndExpireButRejectsOtherTransitions() {
        ConfirmedTicketState state =
                new ConfirmedTicketState();

        Ticket ticketToCancel =
                createTicketInState(
                        TicketStatus.CONFIRMED
                );

        Ticket ticketToExpire =
                createTicketInState(
                        TicketStatus.CONFIRMED
                );

        Ticket alreadyConfirmed =
                createTicketInState(
                        TicketStatus.CONFIRMED
                );

        Ticket ticketForWaitingList =
                createTicketInState(
                        TicketStatus.CONFIRMED
                );

        state.cancel(ticketToCancel);
        state.expire(ticketToExpire);

        assertAll(
                () -> assertEquals(
                        TicketStatus.CANCELLED,
                        ticketToCancel.getStatus()
                ),
                () -> assertEquals(
                        TicketStatus.EXPIRED,
                        ticketToExpire.getStatus()
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.confirm(
                                alreadyConfirmed
                        )
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.moveToWaitingList(
                                ticketForWaitingList
                        )
                )
        );
    }

    @Test
    void waitingListStateAllowsConfirmCancelAndExpireButRejectsDuplicateMove() {
        WaitingListTicketState state =
                new WaitingListTicketState();

        Ticket ticketToConfirm =
                createTicketInState(
                        TicketStatus.WAITING_LIST
                );

        Ticket ticketToCancel =
                createTicketInState(
                        TicketStatus.WAITING_LIST
                );

        Ticket ticketToExpire =
                createTicketInState(
                        TicketStatus.WAITING_LIST
                );

        Ticket alreadyWaiting =
                createTicketInState(
                        TicketStatus.WAITING_LIST
                );

        state.confirm(ticketToConfirm);
        state.cancel(ticketToCancel);
        state.expire(ticketToExpire);

        assertAll(
                () -> assertEquals(
                        TicketStatus.CONFIRMED,
                        ticketToConfirm.getStatus()
                ),
                () -> assertEquals(
                        TicketStatus.CANCELLED,
                        ticketToCancel.getStatus()
                ),
                () -> assertEquals(
                        TicketStatus.EXPIRED,
                        ticketToExpire.getStatus()
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.moveToWaitingList(
                                alreadyWaiting
                        )
                )
        );
    }

    @Test
    void cancelledStateRejectsEveryTransition() {
        CancelledTicketState state =
                new CancelledTicketState();

        Ticket ticket =
                createTicketInState(
                        TicketStatus.CANCELLED
                );

        assertAll(
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.confirm(ticket)
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.moveToWaitingList(
                                ticket
                        )
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.cancel(ticket)
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.expire(ticket)
                ),
                () -> assertEquals(
                        TicketStatus.CANCELLED,
                        ticket.getStatus()
                )
        );
    }

    @Test
    void expiredStateRejectsEveryTransition() {
        ExpiredTicketState state =
                new ExpiredTicketState();

        Ticket ticket =
                createTicketInState(
                        TicketStatus.EXPIRED
                );

        assertAll(
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.confirm(ticket)
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.moveToWaitingList(
                                ticket
                        )
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.cancel(ticket)
                ),
                () -> assertThrows(
                        IllegalStateException.class,
                        () -> state.expire(ticket)
                ),
                () -> assertEquals(
                        TicketStatus.EXPIRED,
                        ticket.getStatus()
                )
        );
    }

    private Ticket createTicketInState(
            TicketStatus targetStatus
    ) {
        Ticket ticket =
                new Ticket(
                        "#STATE-TEST",
                        null,
                        null,
                        TicketStatus.PENDING,
                        "Standard",
                        20.0,
                        LocalDateTime.now(),
                        "NightOut App",
                        "QR-STATE-TEST"
                );

        if (
                targetStatus
                        != TicketStatus.PENDING
        ) {
            ticket.changeStatus(
                    targetStatus
            );
        }

        return ticket;
    }
}