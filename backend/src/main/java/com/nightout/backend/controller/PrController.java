package com.nightout.backend.controller;

import com.nightout.backend.dto.PrDashboardDto;
import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.service.PrDashboardService;
import com.nightout.backend.service.TicketService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pr")
public class PrController {

    private final PrDashboardService
            prDashboardService;

    private final TicketService ticketService;

    public PrController(
            PrDashboardService prDashboardService,
            TicketService ticketService
    ) {
        this.prDashboardService =
                prDashboardService;

        this.ticketService =
                ticketService;
    }

    @GetMapping("/dashboard")
    public PrDashboardDto getDashboard(
            @RequestParam Long prId
    ) {
        return prDashboardService
                .getDashboard(prId);
    }

    @GetMapping("/tickets")
    public List<TicketDto> getTickets(
            @RequestParam Long prId
    ) {
        return ticketService
                .getTicketsForPr(prId);
    }
}