package com.nightout.backend.service;

import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.NotificationDto;
import com.nightout.backend.dto.ProfileDto;
import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.dto.UserDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.EventParticipation;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventParticipationRepository;
import com.nightout.backend.repository.PregameRoomRepository;
import com.nightout.backend.repository.TicketRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final EventParticipationRepository participationRepository;
    private final PregameRoomRepository pregameRoomRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final NightOutMapper mapper;

    public UserService(AppUserRepository userRepository, EventParticipationRepository participationRepository,
            PregameRoomRepository pregameRoomRepository, TicketRepository ticketRepository,
            NotificationService notificationService, NightOutMapper mapper) {
        this.userRepository = userRepository;
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
        List<EventSummaryDto> savedEvents = participationRepository.findByUserId(userId).stream()
                .filter(participation -> "SAVED".equalsIgnoreCase(participation.getStatus()))
                .map(EventParticipation::getEvent)
                .map(mapper::toEventSummaryDto)
                .toList();
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
}
