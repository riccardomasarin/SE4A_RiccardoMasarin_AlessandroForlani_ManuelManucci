package com.nightout.backend.service;

import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.NotificationDto;
import com.nightout.backend.dto.ProfileDto;
import com.nightout.backend.dto.SavedEventDto;
import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.dto.UserDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.EventParticipation;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.EventParticipationRepository;
import com.nightout.backend.repository.PregameRoomRepository;
import com.nightout.backend.repository.TicketRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final String SAVED_STATUS = "SAVED";

    private final AppUserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventParticipationRepository participationRepository;
    private final PregameRoomRepository pregameRoomRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final NightOutMapper mapper;

    public UserService(AppUserRepository userRepository, EventRepository eventRepository,
            EventParticipationRepository participationRepository, PregameRoomRepository pregameRoomRepository,
            TicketRepository ticketRepository,
            NotificationService notificationService, NightOutMapper mapper) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
        this.pregameRoomRepository = pregameRoomRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<UserDto> findUsers(UserRole role) {
        List<AppUser> users = role == null ? userRepository.findAll() : userRepository.findByRole(role);
        return users.stream().map(mapper::toUserDto).toList();
    }

    @Transactional(readOnly = true)
    public UserDto getUser(Long userId) {
        return mapper.toUserDto(userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId)));
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfile(Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        List<EventSummaryDto> savedEvents = findSavedEvents(userId);
        List<TicketDto> tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toTicketDto)
                .toList();
        List<NotificationDto> notifications = notificationService.getNotifications(userId);
        long hostedPregames = pregameRoomRepository.findByHostId(userId).size();
        long attendedNights = tickets.stream()
                .filter(ticket -> ticket.status().name().equals("CONFIRMED"))
                .count();
        return new ProfileDto(mapper.toUserDto(user), attendedNights, tickets.size(), hostedPregames,
                savedEvents, tickets, notifications);
    }

    @Transactional(readOnly = true)
    public List<EventSummaryDto> findSavedEvents(Long userId) {
        ensureUserExists(userId);
        return participationRepository.findByUserIdAndStatusIgnoreCase(userId, SAVED_STATUS).stream()
                .map(EventParticipation::getEvent)
                .map(mapper::toEventSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SavedEventDto getSavedEvent(Long userId, Long eventId) {
        ensureUserExists(userId);
        Event event = findEvent(eventId);
        boolean saved = participationRepository.findByUserIdAndEventId(userId, eventId)
                .map(participation -> SAVED_STATUS.equalsIgnoreCase(participation.getStatus()))
                .orElse(false);
        return new SavedEventDto(userId, eventId, saved, mapper.toEventSummaryDto(event));
    }

    @Transactional
    public SavedEventDto saveEvent(Long userId, Long eventId) {
        AppUser user = findUser(userId);
        Event event = findEvent(eventId);
        EventParticipation participation = participationRepository.findByUserIdAndEventId(userId, eventId)
                .orElseGet(() -> new EventParticipation(user, event, SAVED_STATUS));
        participation.setUser(user);
        participation.setEvent(event);
        participation.setStatus(SAVED_STATUS);
        participationRepository.save(participation);
        return new SavedEventDto(userId, eventId, true, mapper.toEventSummaryDto(event));
    }

    @Transactional
    public SavedEventDto unsaveEvent(Long userId, Long eventId) {
        ensureUserExists(userId);
        Event event = findEvent(eventId);
        participationRepository.findByUserIdAndEventId(userId, eventId)
                .filter(participation -> SAVED_STATUS.equalsIgnoreCase(participation.getStatus()))
                .ifPresent(participationRepository::delete);
        return new SavedEventDto(userId, eventId, false, mapper.toEventSummaryDto(event));
    }

    private AppUser findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }

    private void ensureUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found: " + userId);
        }
    }

    private Event findEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found: " + eventId));
    }
}
