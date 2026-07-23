package com.nightout.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class TicketEntityTests {

    @Test
    void newTicketStartsInPendingStateAndSetsDeadline() {
        LocalDateTime creationTime =
                LocalDateTime.of(
                        2026,
                        7,
                        23,
                        20,
                        0
                );

        Ticket ticket =
                createPendingTicket(
                        creationTime
                );

        assertEquals(
                TicketStatus.PENDING,
                ticket.getStatus()
        );

        assertEquals(
                creationTime,
                ticket.getCreatedAt()
        );

        assertEquals(
                creationTime.plusMinutes(15),
                ticket.getConfirmationDeadline()
        );
    }

    @Test
    void newTicketCannotStartInNonPendingState() {
        LocalDateTime creationTime =
                LocalDateTime.now();

        assertThrows(
                IllegalStateException.class,
                () ->
                        new Ticket(
                                "#TEST",
                                null,
                                null,
                                TicketStatus.CONFIRMED,
                                "Standard",
                                20.0,
                                creationTime,
                                "NightOut App",
                                "QR-TEST"
                        )
        );
    }

    @Test
    void pendingTicketCanBeConfirmed() {
        Ticket ticket =
                createPendingTicket(
                        LocalDateTime.now()
                );

        ticket.changeStatus(
                TicketStatus.CONFIRMED
        );

        assertEquals(
                TicketStatus.CONFIRMED,
                ticket.getStatus()
        );

        assertTrue(
                ticket.isActive()
        );
    }

    @Test
    void confirmedTicketCannotMoveToWaitingList() {
        Ticket ticket =
                createPendingTicket(
                        LocalDateTime.now()
                );

        ticket.changeStatus(
                TicketStatus.CONFIRMED
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        ticket.changeStatus(
                                TicketStatus.WAITING_LIST
                        )
        );

        assertEquals(
                TicketStatus.CONFIRMED,
                ticket.getStatus()
        );
    }

    @Test
    void expiredTicketIsInFinalState() {
        Ticket ticket =
                createPendingTicket(
                        LocalDateTime.now()
                );

        ticket.changeStatus(
                TicketStatus.EXPIRED
        );

        assertFalse(
                ticket.isActive()
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        ticket.changeStatus(
                                TicketStatus.CANCELLED
                        )
        );

        assertEquals(
                TicketStatus.EXPIRED,
                ticket.getStatus()
        );
    }

    @Test
    void confirmationExpiresExactlyAtDeadline() {
        LocalDateTime creationTime =
                LocalDateTime.of(
                        2026,
                        7,
                        23,
                        20,
                        0
                );

        Ticket ticket =
                createPendingTicket(
                        creationTime
                );

        LocalDateTime deadline =
                creationTime.plusMinutes(15);

        assertFalse(
                ticket.isConfirmationExpired(
                        deadline.minusSeconds(1)
                )
        );

        assertTrue(
                ticket.isConfirmationExpired(
                        deadline
                )
        );

        assertTrue(
                ticket.isConfirmationExpired(
                        deadline.plusSeconds(1)
                )
        );
    }

    private Ticket createPendingTicket(
            LocalDateTime creationTime
    ) {
        return new Ticket(
                "#TEST",
                null,
                null,
                TicketStatus.PENDING,
                "Standard",
                20.0,
                creationTime,
                "NightOut App",
                "QR-TEST"
        );
    }
}