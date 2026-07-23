package com.nightout.backend.service;

import com.nightout.backend.dto.PrDashboardDto;
import com.nightout.backend.dto.PrEventPerformanceDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.PrEventAssignment;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.mediator.PrDashboardDataMediator;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrDashboardService {

    private final PrDashboardDataMediator dataMediator;

    public PrDashboardService(
            PrDashboardDataMediator dataMediator
    ) {
        this.dataMediator = dataMediator;
    }

    @Transactional(readOnly = true)
    public PrDashboardDto getDashboard(Long prId) {
        AppUser pr = getPr(prId);

        List<PrEventAssignment> assignments =
                dataMediator.findAssignmentsForPr(prId);

        List<Ticket> tickets =
                dataMediator.findTicketsForPr(prId);

        List<PrEventPerformanceDto> eventPerformance =
                assignments.stream()
                        .map(assignment ->
                                toEventPerformance(
                                        assignment,
                                        tickets
                                )
                        )
                        .sorted(
                                Comparator.comparing(
                                        PrEventPerformanceDto::eventStartsAt
                                ).reversed()
                        )
                        .toList();

        long totalTicketsSold = tickets.stream()
                .filter(ticket ->
                        ticket.getStatus()
                                != TicketStatus.CANCELLED
                )
                .count();

        long confirmedTickets =
                countStatus(
                        tickets,
                        TicketStatus.CONFIRMED
                );

        long cancelledTickets =
                countStatus(
                        tickets,
                        TicketStatus.CANCELLED
                );

        long waitingListTickets =
                countStatus(
                        tickets,
                        TicketStatus.WAITING_LIST
                );

        long totalCheckins = tickets.stream()
                .filter(ticket ->
                        ticket.getCheckedInAt() != null
                )
                .count();

        double totalRevenue = roundMoney(
                tickets.stream()
                        .filter(ticket ->
                                ticket.getStatus()
                                        != TicketStatus.CANCELLED
                        )
                        .mapToDouble(
                                Ticket::getPricePaid
                        )
                        .sum()
        );

        double totalCommissionEarned = roundMoney(
                tickets.stream()
                        .filter(ticket ->
                                ticket.getStatus()
                                        != TicketStatus.CANCELLED
                        )
                        .mapToDouble(
                                Ticket::getCommissionAmount
                        )
                        .sum()
        );

        PrEventPerformanceDto currentEvent =
                findCurrentEvent(eventPerformance);

        return new PrDashboardDto(
                pr.getId(),
                pr.getName(),
                totalTicketsSold,
                confirmedTickets,
                cancelledTickets,
                waitingListTickets,
                totalCheckins,
                totalRevenue,
                totalCommissionEarned,
                currentEvent,
                eventPerformance
        );
    }

    private AppUser getPr(Long prId) {
        AppUser pr = dataMediator.findUserById(prId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "PR manager not found: " + prId
                        )
                );

        if (pr.getRole() != UserRole.PR_MANAGER) {
            throw new BadRequestException(
                    "The selected user is not a PR manager."
            );
        }

        return pr;
    }

    private PrEventPerformanceDto toEventPerformance(
            PrEventAssignment assignment,
            List<Ticket> allTickets
    ) {
        List<Ticket> assignmentTickets =
                allTickets.stream()
                        .filter(ticket ->
                                ticket.getPrAssignment() != null
                                        && ticket.getPrAssignment()
                                                .getId()
                                                .equals(
                                                        assignment.getId()
                                                )
                        )
                        .toList();

        long ticketsSold = assignmentTickets.stream()
                .filter(ticket ->
                        ticket.getStatus()
                                != TicketStatus.CANCELLED
                )
                .count();

        long confirmedTickets =
                countStatus(
                        assignmentTickets,
                        TicketStatus.CONFIRMED
                );

        long cancelledTickets =
                countStatus(
                        assignmentTickets,
                        TicketStatus.CANCELLED
                );

        long waitingListTickets =
                countStatus(
                        assignmentTickets,
                        TicketStatus.WAITING_LIST
                );

        long checkins = assignmentTickets.stream()
                .filter(ticket ->
                        ticket.getCheckedInAt() != null
                )
                .count();

        double revenue = roundMoney(
                assignmentTickets.stream()
                        .filter(ticket ->
                                ticket.getStatus()
                                        != TicketStatus.CANCELLED
                        )
                        .mapToDouble(
                                Ticket::getPricePaid
                        )
                        .sum()
        );

        double commissionEarned = roundMoney(
                assignmentTickets.stream()
                        .filter(ticket ->
                                ticket.getStatus()
                                        != TicketStatus.CANCELLED
                        )
                        .mapToDouble(
                                Ticket::getCommissionAmount
                        )
                        .sum()
        );

        return new PrEventPerformanceDto(
                assignment.getId(),
                assignment.getEvent().getId(),
                assignment.getEvent().getTitle(),
                assignment.getEvent()
                        .getVenue()
                        .getName(),
                assignment.getEvent()
                        .getStartsAt(),
                assignment.getPromoCode(),
                assignment.getDiscountPercentage(),
                assignment.getCommissionPerTicket(),
                assignment.isActive(),
                ticketsSold,
                confirmedTickets,
                cancelledTickets,
                waitingListTickets,
                checkins,
                revenue,
                commissionEarned
        );
    }

    private PrEventPerformanceDto findCurrentEvent(
            List<PrEventPerformanceDto> eventPerformance
    ) {
        LocalDateTime now = LocalDateTime.now();

        return eventPerformance.stream()
                .filter(performance ->
                        performance.active()
                                && !performance
                                        .eventStartsAt()
                                        .isBefore(now)
                )
                .min(
                        Comparator.comparing(
                                PrEventPerformanceDto::eventStartsAt
                        )
                )
                .orElseGet(() ->
                        eventPerformance.stream()
                                .filter(
                                        PrEventPerformanceDto::active
                                )
                                .max(
                                        Comparator.comparing(
                                                PrEventPerformanceDto
                                                        ::eventStartsAt
                                        )
                                )
                                .orElse(null)
                );
    }

    private long countStatus(
            List<Ticket> tickets,
            TicketStatus status
    ) {
        return tickets.stream()
                .filter(ticket ->
                        ticket.getStatus() == status
                )
                .count();
    }

    private double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}