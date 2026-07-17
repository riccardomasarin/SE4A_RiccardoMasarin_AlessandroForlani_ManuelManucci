package com.nightout.backend.service;

import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.dto.TicketRequestDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.NotificationType;
import com.nightout.backend.entity.PrEventAssignment;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.mediator.TicketDataMediator;
import com.nightout.backend.ticketevent.TicketNotificationEvent;
import com.nightout.backend.ticketstate.TicketState;
import com.nightout.backend.ticketstate.TicketStateFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {

    private static final List<TicketStatus> ACTIVE_STATUSES =
            List.of(
                    TicketStatus.PENDING,
                    TicketStatus.CONFIRMED,
                    TicketStatus.WAITING_LIST
            );

    private final TicketDataMediator ticketDataMediator;

    private final ApplicationEventPublisher eventPublisher;

    private final NightOutMapper mapper;

    public TicketService(
            TicketDataMediator ticketDataMediator,
            ApplicationEventPublisher eventPublisher,
            NightOutMapper mapper
    ) {
        this.ticketDataMediator = ticketDataMediator;
        this.eventPublisher = eventPublisher;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getTicketsForUser(
            Long userId
    ) {
        return ticketDataMediator
                .findTicketsForUser(userId)
                .stream()
                .map(mapper::toTicketDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getTicketsForManager(
            Long managerId
    ) {
        AppUser manager =
                ticketDataMediator
                        .findUserById(managerId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Manager not found: "
                                                        + managerId
                                        )
                        );

        if (
                manager.getRole()
                        != UserRole.VENUE_MANAGER
        ) {
            throw new BadRequestException(
                    "Only a venue manager can view venue tickets."
            );
        }

        return ticketDataMediator
                .findTicketsForManager(managerId)
                .stream()
                .map(mapper::toTicketDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getTicketsForPr(
            Long prId
    ) {
        AppUser pr =
                ticketDataMediator
                        .findUserById(prId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "PR manager not found: "
                                                        + prId
                                        )
                        );

        if (
                pr.getRole()
                        != UserRole.PR_MANAGER
        ) {
            throw new BadRequestException(
                    "Only a PR manager can view PR ticket sales."
            );
        }

        return ticketDataMediator
                .findTicketsForPr(prId)
                .stream()
                .map(mapper::toTicketDto)
                .toList();
    }

    @Transactional
    public TicketDto requestTicket(
            TicketRequestDto request
    ) {
        AppUser user =
                ticketDataMediator
                        .findUserById(request.userId())
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "User not found: "
                                                        + request.userId()
                                        )
                        );

        Event event =
                ticketDataMediator
                        .findEventById(request.eventId())
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Event not found: "
                                                        + request.eventId()
                                        )
                        );

        boolean duplicate =
                ticketDataMediator.hasActiveTicket(
                        user.getId(),
                        event.getId(),
                        ACTIVE_STATUSES
                );

        if (duplicate) {
            throw new BadRequestException(
                    "User already has an active ticket or waiting list entry for this event."
            );
        }

        long confirmed =
                ticketDataMediator
                        .countConfirmedTickets(
                                event.getId()
                        );

        TicketStatus targetStatus =
                confirmed < event.getCapacity()
                        ? TicketStatus.CONFIRMED
                        : TicketStatus.WAITING_LIST;

        String ticketType =
                request.ticketType() == null
                                || request
                                        .ticketType()
                                        .isBlank()
                        ? "Standard"
                        : request.ticketType().trim();

        double basePrice =
                ticketType.equalsIgnoreCase("VIP")
                        ? event.getVipPrice()
                        : event.getPrice();

        PrEventAssignment prAssignment =
                resolvePrAssignment(
                        event.getId(),
                        request.promoCode()
                );

        double discountAmount = 0.0;
        double commissionAmount = 0.0;
        String promoCodeUsed = null;

        if (prAssignment != null) {
            promoCodeUsed =
                    prAssignment.getPromoCode();

            discountAmount =
                    roundMoney(
                            basePrice
                                    * prAssignment
                                            .getDiscountPercentage()
                                    / 100.0
                    );

            if (
                    targetStatus
                            == TicketStatus.CONFIRMED
            ) {
                commissionAmount =
                        roundMoney(
                                prAssignment
                                        .getCommissionPerTicket()
                        );
            }
        }

        double pricePaid =
                roundMoney(
                        Math.max(
                                0.0,
                                basePrice
                                        - discountAmount
                        )
                );

        String salesChannel;

        if (prAssignment != null) {
            salesChannel =
                    "PR Code - "
                            + prAssignment.getPromoCode();
        } else {
            salesChannel =
                    request.salesChannel() == null
                                    || request
                                            .salesChannel()
                                            .isBlank()
                            ? "NightOut App"
                            : request
                                    .salesChannel()
                                    .trim();
        }

        Ticket ticket =
                new Ticket(
                        generateCode(),
                        user,
                        event,
                        TicketStatus.PENDING,
                        ticketType,
                        pricePaid,
                        LocalDateTime.now(),
                        salesChannel,
                        "NIGHTOUT:"
                                + event.getId()
                                + ":"
                                + user.getId()
                );

        TicketState pendingState =
                TicketStateFactory.from(
                        ticket.getStatus()
                );

        if (
                targetStatus
                        == TicketStatus.CONFIRMED
        ) {
            pendingState.confirm(ticket);
        } else {
            pendingState.moveToWaitingList(ticket);
        }

        ticket.setPrAssignment(prAssignment);
        ticket.setPromoCodeUsed(promoCodeUsed);
        ticket.setDiscountAmount(discountAmount);
        ticket.setCommissionAmount(commissionAmount);

        Ticket savedTicket =
                ticketDataMediator.saveTicket(ticket);

        String message =
                savedTicket.getStatus()
                                == TicketStatus.CONFIRMED
                        ? "Ticket confirmed for "
                                + event.getTitle()
                        : "You are on the waiting list for "
                                + event.getTitle();

        eventPublisher.publishEvent(
                new TicketNotificationEvent(
                        user,
                        NotificationType.RESERVATION_UPDATE,
                        message
                )
        );

        return mapper.toTicketDto(savedTicket);
    }

    @Transactional
    public TicketDto cancelTicket(
            Long ticketId
    ) {
        Ticket ticket =
                ticketDataMediator
                        .findTicketById(ticketId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Ticket not found: "
                                                        + ticketId
                                        )
                        );

        boolean wasConfirmed =
                ticket.getStatus()
                        == TicketStatus.CONFIRMED;

        TicketState currentState =
                TicketStateFactory.from(
                        ticket.getStatus()
                );

        try {
            currentState.cancel(ticket);
        } catch (IllegalStateException exception) {
            throw new BadRequestException(
                    exception.getMessage()
            );
        }

        ticket.setCommissionAmount(0.0);

        Ticket savedTicket =
                ticketDataMediator.saveTicket(ticket);

        eventPublisher.publishEvent(
                new TicketNotificationEvent(
                        ticket.getUser(),
                        NotificationType.RESERVATION_UPDATE,
                        "Ticket cancelled for "
                                + ticket
                                        .getEvent()
                                        .getTitle()
                )
        );

        if (wasConfirmed) {
            promoteFirstWaitingTicket(
                    ticket.getEvent()
            );
        }

        return mapper.toTicketDto(savedTicket);
    }

    private void promoteFirstWaitingTicket(
            Event event
    ) {
        List<Ticket> waitingList =
                ticketDataMediator
                        .findWaitingList(
                                event.getId()
                        );

        if (waitingList.isEmpty()) {
            return;
        }

        Ticket promoted =
                waitingList.getFirst();

        TicketState waitingListState =
                TicketStateFactory.from(
                        promoted.getStatus()
                );

        try {
            waitingListState.confirm(promoted);
        } catch (IllegalStateException exception) {
            throw new BadRequestException(
                    exception.getMessage()
            );
        }

        if (
                promoted.getPrAssignment()
                        != null
        ) {
            promoted.setCommissionAmount(
                    roundMoney(
                            promoted
                                    .getPrAssignment()
                                    .getCommissionPerTicket()
                    )
            );
        }

        ticketDataMediator.saveTicket(promoted);

        eventPublisher.publishEvent(
                new TicketNotificationEvent(
                        promoted.getUser(),
                        NotificationType.WAITING_LIST_AVAILABLE,
                        "A spot opened up. Your ticket for "
                                + event.getTitle()
                                + " is now confirmed."
                )
        );
    }

    private PrEventAssignment resolvePrAssignment(
            Long eventId,
            String promoCode
    ) {
        if (
                promoCode == null
                        || promoCode.isBlank()
        ) {
            return null;
        }

        String normalizedCode =
                promoCode
                        .trim()
                        .toUpperCase();

        return ticketDataMediator
                .findActivePrAssignment(
                        eventId,
                        normalizedCode
                )
                .orElseThrow(
                        () ->
                                new BadRequestException(
                                        "Invalid or inactive PR promo code."
                                )
                );
    }

    private double roundMoney(
            double value
    ) {
        return Math.round(
                value * 100.0
        ) / 100.0;
    }

    private String generateCode() {
        return "#A1-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 4)
                        .toUpperCase();
    }
}