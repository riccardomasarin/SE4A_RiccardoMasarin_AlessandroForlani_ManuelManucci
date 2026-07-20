package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.PrEventAssignment;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.PrEventAssignmentRepository;
import com.nightout.backend.repository.TicketRepository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class TicketDataMediator {

    private final TicketRepository ticketRepository;

    private final AppUserRepository userRepository;

    private final EventRepository eventRepository;

    private final PrEventAssignmentRepository
            prAssignmentRepository;

    public TicketDataMediator(
            TicketRepository ticketRepository,
            AppUserRepository userRepository,
            EventRepository eventRepository,
            PrEventAssignmentRepository
                    prAssignmentRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.prAssignmentRepository =
                prAssignmentRepository;
    }

    public Optional<AppUser> findUserById(
            Long userId
    ) {
        return userRepository.findById(userId);
    }

    public Optional<Event> findEventById(
            Long eventId
    ) {
        return eventRepository.findById(eventId);
    }

    public Optional<Ticket> findTicketById(
            Long ticketId
    ) {
        return ticketRepository.findById(ticketId);
    }

    public List<Ticket> findTicketsForUser(
            Long userId
    ) {
        return ticketRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }

    public List<Ticket> findTicketsForManager(
            Long managerId
    ) {
        return ticketRepository
                .findByEventCreatedByIdOrderByCreatedAtDesc(
                        managerId
                );
    }

    public List<Ticket> findTicketsForPr(
            Long prId
    ) {
        return ticketRepository
                .findByPrAssignmentPrIdOrderByCreatedAtDesc(
                        prId
                );
    }

    public boolean hasActiveTicket(
            Long userId,
            Long eventId,
            Collection<TicketStatus> activeStatuses
    ) {
        return ticketRepository
                .existsByUserIdAndEventIdAndStatusIn(
                        userId,
                        eventId,
                        activeStatuses
                );
    }

    public long countConfirmedTickets(
            Long eventId
    ) {
        return ticketRepository
                .countByEventIdAndStatus(
                        eventId,
                        TicketStatus.CONFIRMED
                );
    }

    public List<Ticket> findWaitingList(
            Long eventId
    ) {
        return ticketRepository
                .findByEventIdAndStatusOrderByCreatedAtAsc(
                        eventId,
                        TicketStatus.WAITING_LIST
                );
    }

    /*
     * Recupera tutti i ticket ancora PENDING
     * la cui deadline di conferma è già trascorsa.
     */
    public List<Ticket> findExpiredPendingTickets(
        LocalDateTime currentTime
) {
    return ticketRepository
            .findByStatusAndConfirmationDeadlineLessThanEqual(
                    TicketStatus.PENDING,
                    currentTime
            );
}

/*
 * Recupera i ticket in WAITING_LIST
 * relativi a eventi già iniziati.
 */
public List<Ticket> findWaitingListTicketsForStartedEvents(
        LocalDateTime currentTime
) {
    return ticketRepository
            .findByStatusAndEvent_StartsAtLessThanEqual(
                    TicketStatus.WAITING_LIST,
                    currentTime
            );
}

/*
 * Recupera i ticket CONFIRMED
 * relativi a eventi già terminati.
 */
public List<Ticket> findConfirmedTicketsForEndedEvents(
        LocalDateTime currentTime
) {
    return ticketRepository
            .findByStatusAndEvent_EndsAtLessThanEqual(
                    TicketStatus.CONFIRMED,
                    currentTime
            );
}

    public Optional<PrEventAssignment>
            findActivePrAssignment(
                    Long eventId,
                    String promoCode
            ) {
        return prAssignmentRepository
                .findByEventIdAndPromoCodeIgnoreCaseAndActiveTrue(
                        eventId,
                        promoCode
                );
    }

    public Ticket saveTicket(
            Ticket ticket
    ) {
        return ticketRepository.save(ticket);
    }
}