package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.Friendship;
import com.nightout.backend.entity.FriendshipStatus;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventParticipationRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.FriendshipRepository;
import com.nightout.backend.repository.TicketRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class RecommendationDataMediator {

    private static final List<TicketStatus>
            ACTIVE_TICKET_STATUSES =
            List.of(
                    TicketStatus.PENDING,
                    TicketStatus.CONFIRMED,
                    TicketStatus.WAITING_LIST
            );

    private final AppUserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventParticipationRepository
            participationRepository;
    private final TicketRepository ticketRepository;
    private final FriendshipRepository friendshipRepository;

    public RecommendationDataMediator(
            AppUserRepository userRepository,
            EventRepository eventRepository,
            EventParticipationRepository
                    participationRepository,
            TicketRepository ticketRepository,
            FriendshipRepository friendshipRepository
    ) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.participationRepository =
                participationRepository;
        this.ticketRepository = ticketRepository;
        this.friendshipRepository =
                friendshipRepository;
    }

    public Optional<AppUser> findUserById(
            Long userId
    ) {
        return userRepository.findById(userId);
    }

    public List<Event> findAllEvents() {
        return eventRepository.findAll();
    }

    public long countSavedEventsWithSameGenre(
            Long userId,
            Event candidateEvent
    ) {
        return participationRepository
                .findByUserIdAndStatusIgnoreCase(
                        userId,
                        "SAVED"
                )
                .stream()
                .map(participation ->
                        participation.getEvent()
                )
                .filter(event ->
                        event.getMusicGenre()
                                == candidateEvent
                                .getMusicGenre()
                )
                .filter(event ->
                        !event.getId().equals(
                                candidateEvent.getId()
                        )
                )
                .count();
    }

    public long countConfirmedTicketsWithSameGenre(
            Long userId,
            Event candidateEvent
    ) {
        return ticketRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                )
                .stream()
                .filter(ticket ->
                        ticket.getStatus()
                                == TicketStatus.CONFIRMED
                )
                .map(ticket ->
                        ticket.getEvent()
                )
                .filter(event ->
                        event.getMusicGenre()
                                == candidateEvent
                                .getMusicGenre()
                )
                .filter(event ->
                        !event.getId().equals(
                                candidateEvent.getId()
                        )
                )
                .count();
    }

    public long countFriendsAttending(
            Long userId,
            Long eventId
    ) {
        Set<Long> friendIds =
                findAcceptedFriendIds(userId);

        if (friendIds.isEmpty()) {
            return 0;
        }

        return ticketRepository
                .findByEventId(eventId)
                .stream()
                .filter(ticket ->
                        ticket.getStatus()
                                == TicketStatus.CONFIRMED
                )
                .map(ticket ->
                        ticket.getUser().getId()
                )
                .filter(friendIds::contains)
                .distinct()
                .count();
    }

    public boolean hasActiveTicket(
            Long userId,
            Long eventId
    ) {
        return ticketRepository
                .existsByUserIdAndEventIdAndStatusIn(
                        userId,
                        eventId,
                        ACTIVE_TICKET_STATUSES
                );
    }

    private Set<Long> findAcceptedFriendIds(
            Long userId
    ) {
        return friendshipRepository
                .findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
                        userId,
                        userId
                )
                .stream()
                .filter(friendship ->
                        friendship.getStatus()
                                == FriendshipStatus.ACCEPTED
                )
                .map(friendship ->
                        getOtherUserId(
                                friendship,
                                userId
                        )
                )
                .collect(Collectors.toSet());
    }

    private Long getOtherUserId(
            Friendship friendship,
            Long userId
    ) {
        if (
                friendship.getSender()
                        .getId()
                        .equals(userId)
        ) {
            return friendship
                    .getReceiver()
                    .getId();
        }

        return friendship
                .getSender()
                .getId();
    }
}