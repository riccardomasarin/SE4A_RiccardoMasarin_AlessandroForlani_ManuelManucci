package com.nightout.backend;

import static org.mockito.Mockito.verify;

import com.nightout.backend.service.TicketExpirationScheduler;
import com.nightout.backend.service.TicketService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TicketExpirationSchedulerTests {

    @Mock
    private TicketService ticketService;

    @InjectMocks
    private TicketExpirationScheduler scheduler;

    @Test
    void schedulerDelegatesAutomaticTransitionsToTicketService() {
        scheduler.processAutomaticTicketTransitions();

        verify(ticketService)
                .processAutomaticTicketTransitions();
    }
}