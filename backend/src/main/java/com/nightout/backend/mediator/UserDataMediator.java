package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.EventParticipation;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventParticipationRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.PregameRoomRepository;
import com.nightout.backend.repository.TicketRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class UserDataMediator {

    private final AppUserRepository userRepository;

    private final EventRepository eventRepository;

    private final EventParticipationRepository
            participationRepository;

    private final PregameRoomRepository
            pregameRoomRepository;

    private final TicketRepository ticketRepository;

    public UserDataMediator(
            AppUserRepository userRepository,
            EventRepository eventRepository,
            EventParticipationRepository
                    participationRepository,
            PregameRoomRepository
                    pregameRoomRepository,
            TicketRepository ticketRepository
    ) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.participationRepository =
                participationRepository;
        this.pregameRoomRepository =
                pregameRoomRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<AppUser> findAllUsers() {
        return userRepository.findAll();
    }

    public List<AppUser> findUsersByRole(
            UserRole role
    ) {
        return userRepository.findByRole(role);
    }

    public Optional<AppUser> findUserById(
            Long userId
    ) {
        return userRepository.findById(userId);
    }

    public boolean userExists(
            Long userId
    ) {
        return userRepository.existsById(userId);
    }

    public boolean emailUsedByAnotherUser(
            String email,
            Long userId
    ) {
        return userRepository
                .existsByEmailIgnoreCaseAndIdNot(
                        email,
                        userId
                );
    }

    public AppUser saveUser(
            AppUser user
    ) {
        return userRepository.save(user);
    }

    public Optional<Event> findEventById(
            Long eventId
    ) {
        return eventRepository.findById(eventId);
    }

    public List<EventParticipation>
            findSavedParticipations(
                    Long userId,
                    String status
            ) {
        return participationRepository
                .findByUserIdAndStatusIgnoreCase(
                        userId,
                        status
                );
    }

    public Optional<EventParticipation>
            findParticipation(
                    Long userId,
                    Long eventId
            ) {
        return participationRepository
                .findByUserIdAndEventId(
                        userId,
                        eventId
                );
    }

    public EventParticipation saveParticipation(
            EventParticipation participation
    ) {
        return participationRepository.save(
                participation
        );
    }

    public void deleteParticipation(
            EventParticipation participation
    ) {
        participationRepository.delete(
                participation
        );
    }

    public List<Ticket> findTicketsForUser(
            Long userId
    ) {
        return ticketRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }

    public long countHostedPregames(
            Long userId
    ) {
        return pregameRoomRepository
                .findByHostId(userId)
                .size();
    }
}