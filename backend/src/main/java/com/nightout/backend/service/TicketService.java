package com.nightout.backend.service;

import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.dto.TicketRequestDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.NotificationType;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.TicketRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {

    private static final List<TicketStatus> ACTIVE_STATUSES = List.of(
            TicketStatus.PENDING,
            TicketStatus.CONFIRMED,
            TicketStatus.WAITING_LIST
    );

    private final TicketRepository ticketRepository;
    private final AppUserRepository userRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final NightOutMapper mapper;

    public TicketService(TicketRepository ticketRepository, AppUserRepository userRepository,
            EventRepository eventRepository, NotificationService notificationService, NightOutMapper mapper) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getTicketsForUser(Long userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toTicketDto)
                .toList();
    }

    @Transactional
    public TicketDto requestTicket(TicketRequestDto request) {
        AppUser user = userRepository.findById(request.userId())
                .orElseThrow(() -> new NotFoundException("User not found: " + request.userId()));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new NotFoundException("Event not found: " + request.eventId()));
        boolean duplicate = ticketRepository.existsByUserIdAndEventIdAndStatusIn(user.getId(), event.getId(),
                ACTIVE_STATUSES);
        if (duplicate) {
            throw new BadRequestException("User already has an active ticket or waiting list entry for this event.");
        }

        long confirmed = ticketRepository.countByEventIdAndStatus(event.getId(), TicketStatus.CONFIRMED);
        TicketStatus status = confirmed < event.getCapacity() ? TicketStatus.CONFIRMED : TicketStatus.WAITING_LIST;
        String ticketType = request.ticketType() == null || request.ticketType().isBlank()
                ? "Standard"
                : request.ticketType();
        String salesChannel = request.salesChannel() == null || request.salesChannel().isBlank()
                ? "NightOut App"
                : request.salesChannel();
        Ticket ticket = new Ticket(generateCode(), user, event, status, ticketType, event.getPrice(),
                LocalDateTime.now(), salesChannel, "NIGHTOUT:" + event.getId() + ":" + user.getId());
        Ticket savedTicket = ticketRepository.save(ticket);

        String message = status == TicketStatus.CONFIRMED
                ? "Ticket confirmed for " + event.getTitle()
                : "You are on the waiting list for " + event.getTitle();
        notificationService.createNotification(user, NotificationType.RESERVATION_UPDATE, message);
        return mapper.toTicketDto(savedTicket);
    }

    @Transactional
    public TicketDto cancelTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NotFoundException("Ticket not found: " + ticketId));
        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new BadRequestException("Ticket is already cancelled.");
        }
        boolean wasConfirmed = ticket.getStatus() == TicketStatus.CONFIRMED;
        ticket.setStatus(TicketStatus.CANCELLED);
        Ticket savedTicket = ticketRepository.save(ticket);
        notificationService.createNotification(ticket.getUser(), NotificationType.RESERVATION_UPDATE,
                "Ticket cancelled for " + ticket.getEvent().getTitle());

        if (wasConfirmed) {
            promoteFirstWaitingTicket(ticket.getEvent());
        }
        return mapper.toTicketDto(savedTicket);
    }

    private void promoteFirstWaitingTicket(Event event) {
        List<Ticket> waitingList = ticketRepository.findByEventIdAndStatusOrderByCreatedAtAsc(
                event.getId(), TicketStatus.WAITING_LIST);
        if (waitingList.isEmpty()) {
            return;
        }
        Ticket promoted = waitingList.getFirst();
        promoted.setStatus(TicketStatus.CONFIRMED);
        ticketRepository.save(promoted);
        notificationService.createNotification(promoted.getUser(), NotificationType.WAITING_LIST_AVAILABLE,
                "A spot opened up. Your ticket for " + event.getTitle() + " is now confirmed.");
    }

    private String generateCode() {
        return "#A1-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
}
