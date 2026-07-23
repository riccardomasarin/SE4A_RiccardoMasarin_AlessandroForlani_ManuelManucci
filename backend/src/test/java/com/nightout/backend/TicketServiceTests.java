package com.nightout.backend;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nightout.backend.dto.TicketRequestDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.mediator.TicketDataMediator;
import com.nightout.backend.service.BadRequestException;
import com.nightout.backend.service.NightOutMapper;
import com.nightout.backend.service.TicketService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class TicketServiceTests {

    @Mock
    private TicketDataMediator ticketDataMediator;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private NightOutMapper mapper;

    @Mock
    private TicketRequestDto request;

    @Mock
    private AppUser user;

    @Mock
    private Event event;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void ticketRequestIsRejectedWhenEventHasAlreadyStarted() {
        when(request.userId()).thenReturn(1L);
        when(request.eventId()).thenReturn(10L);

        when(ticketDataMediator.findUserById(1L))
                .thenReturn(Optional.of(user));

        when(ticketDataMediator.findEventById(10L))
                .thenReturn(Optional.of(event));

        when(event.hasStarted(any(LocalDateTime.class)))
                .thenReturn(true);

        assertThrows(
                BadRequestException.class,
                () -> ticketService.requestTicket(request)
        );

        verify(ticketDataMediator, never())
                .saveTicket(any());
    }

    @Test
    void duplicateActiveTicketIsRejected() {
        when(request.userId()).thenReturn(1L);
        when(request.eventId()).thenReturn(10L);

        when(ticketDataMediator.findUserById(1L))
                .thenReturn(Optional.of(user));

        when(ticketDataMediator.findEventById(10L))
                .thenReturn(Optional.of(event));

        when(event.hasStarted(any(LocalDateTime.class)))
                .thenReturn(false);

        when(user.getId()).thenReturn(1L);
        when(event.getId()).thenReturn(10L);

        when(
                ticketDataMediator.hasActiveTicket(
                        eq(1L),
                        eq(10L),
                        anyList()
                )
        ).thenReturn(true);

        assertThrows(
                BadRequestException.class,
                () -> ticketService.requestTicket(request)
        );

        verify(ticketDataMediator, never())
                .saveTicket(any());
    }

    @Test
    void automaticTransitionProcessChecksAllTicketCategories() {
        when(
                ticketDataMediator.findExpiredPendingTickets(
                        any(LocalDateTime.class)
                )
        ).thenReturn(List.of());

        when(
                ticketDataMediator
                        .findWaitingListTicketsForStartedEvents(
                                any(LocalDateTime.class)
                        )
        ).thenReturn(List.of());

        when(
                ticketDataMediator
                        .findConfirmedTicketsForEndedEvents(
                                any(LocalDateTime.class)
                        )
        ).thenReturn(List.of());

        ticketService.processAutomaticTicketTransitions();

        verify(ticketDataMediator)
                .findExpiredPendingTickets(
                        any(LocalDateTime.class)
                );

        verify(ticketDataMediator)
                .findWaitingListTicketsForStartedEvents(
                        any(LocalDateTime.class)
                );

        verify(ticketDataMediator)
                .findConfirmedTicketsForEndedEvents(
                        any(LocalDateTime.class)
                );

        verify(ticketDataMediator, never())
                .saveTicket(any());
    }
}