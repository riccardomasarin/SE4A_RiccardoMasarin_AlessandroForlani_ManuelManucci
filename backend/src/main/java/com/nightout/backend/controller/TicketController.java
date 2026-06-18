package com.nightout.backend.controller;

import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.dto.TicketRequestDto;
import com.nightout.backend.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/users/{userId}/tickets")
    public List<TicketDto> getUserTickets(@PathVariable Long userId) {
        return ticketService.getTicketsForUser(userId);
    }

    @PostMapping("/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDto requestTicket(@Valid @RequestBody TicketRequestDto request) {
        return ticketService.requestTicket(request);
    }

    @DeleteMapping("/tickets/{ticketId}")
    public TicketDto cancelTicket(@PathVariable Long ticketId) {
        return ticketService.cancelTicket(ticketId);
    }
}
