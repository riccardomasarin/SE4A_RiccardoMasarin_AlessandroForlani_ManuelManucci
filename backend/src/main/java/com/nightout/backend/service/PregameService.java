package com.nightout.backend.service;

import com.nightout.backend.dto.CreatePregameRoomDto;
import com.nightout.backend.dto.PregameRoomDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.NotificationType;
import com.nightout.backend.entity.PregameRoom;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.PregameRoomRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PregameService {

    private final PregameRoomRepository pregameRoomRepository;
    private final AppUserRepository userRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final NightOutMapper mapper;

    public PregameService(PregameRoomRepository pregameRoomRepository, AppUserRepository userRepository,
            EventRepository eventRepository, NotificationService notificationService, NightOutMapper mapper) {
        this.pregameRoomRepository = pregameRoomRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<PregameRoomDto> findPregames(Long eventId) {
        List<PregameRoom> rooms = eventId == null
                ? pregameRoomRepository.findAll()
                : pregameRoomRepository.findByEventId(eventId);
        return rooms.stream()
                .sorted(Comparator.comparing(PregameRoom::getMeetingTime))
                .map(mapper::toPregameRoomDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PregameRoomDto getPregame(Long roomId) {
        return mapper.toPregameRoomDto(pregameRoomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Pregame room not found: " + roomId)));
    }

    @Transactional
    public PregameRoomDto createPregame(CreatePregameRoomDto request) {
        AppUser host = userRepository.findById(request.hostId())
                .orElseThrow(() -> new NotFoundException("Host user not found: " + request.hostId()));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new NotFoundException("Event not found: " + request.eventId()));
        PregameRoom room = new PregameRoom(request.title(), host, event, request.meetingLocation(),
                request.meetingTime(), request.maxParticipants(), request.description(), request.imageUrl(),
                request.officialPartner());
        room.getParticipants().add(host);
        PregameRoom savedRoom = pregameRoomRepository.save(room);
        notificationService.createNotification(host, NotificationType.PREGAME_UPDATE,
                "Pregame created for " + event.getTitle());
        return mapper.toPregameRoomDto(savedRoom);
    }

    @Transactional
    public PregameRoomDto joinPregame(Long roomId, Long userId) {
        PregameRoom room = pregameRoomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Pregame room not found: " + roomId));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        boolean alreadyJoined = room.getParticipants().stream().anyMatch(participant -> participant.getId().equals(userId));
        if (alreadyJoined) {
            throw new BadRequestException("User already joined this pregame room.");
        }
        if (room.getParticipants().size() >= room.getMaxParticipants()) {
            throw new BadRequestException("Pregame room is full.");
        }
        room.getParticipants().add(user);
        PregameRoom savedRoom = pregameRoomRepository.save(room);
        notificationService.createNotification(user, NotificationType.PREGAME_UPDATE,
                "You joined " + room.getTitle());
        return mapper.toPregameRoomDto(savedRoom);
    }

    @Transactional
    public PregameRoomDto leavePregame(Long roomId, Long userId) {
        PregameRoom room = pregameRoomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Pregame room not found: " + roomId));
        boolean removed = room.getParticipants().removeIf(user -> user.getId().equals(userId));
        if (!removed) {
            throw new BadRequestException("User is not a participant of this pregame room.");
        }
        PregameRoom savedRoom = pregameRoomRepository.save(room);
        notificationService.createNotification(userId, NotificationType.PREGAME_UPDATE,
                "You left " + room.getTitle());
        return mapper.toPregameRoomDto(savedRoom);
    }
}
