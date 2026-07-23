package com.nightout.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TicketExpirationScheduler {

    private final TicketService ticketService;

    public TicketExpirationScheduler(
            TicketService ticketService
    ) {
        this.ticketService = ticketService;
    }

    /*
     * Ogni minuto controlla tutte le transizioni
     * automatiche del ciclo di vita dei ticket.
     */
    @Scheduled(fixedRate = 60000)
    public void processAutomaticTicketTransitions() {
        ticketService
                .processAutomaticTicketTransitions();
    }
}