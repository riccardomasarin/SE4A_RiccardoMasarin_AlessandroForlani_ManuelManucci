package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.PregameRoom;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.PregameRoomRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class PregameDataMediator {

    private final PregameRoomRepository
            pregameRoomRepository;

    private final AppUserRepository userRepository;

    private final EventRepository eventRepository;

    public PregameDataMediator(
            PregameRoomRepository pregameRoomRepository,
            AppUserRepository userRepository,
            EventRepository eventRepository
    ) {
        this.pregameRoomRepository =
                pregameRoomRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    public List<PregameRoom> findAllPregames() {
        return pregameRoomRepository.findAll();
    }

    public List<PregameRoom> findPregamesByEvent(
            Long eventId
    ) {
        return pregameRoomRepository
                .findByEventId(eventId);
    }

    public Optional<PregameRoom> findPregameById(
            Long roomId
    ) {
        return pregameRoomRepository
                .findById(roomId);
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

    public PregameRoom savePregame(
            PregameRoom room
    ) {
        return pregameRoomRepository.save(room);
    }

    public void deletePregame(
            PregameRoom room
    ) {
        pregameRoomRepository.delete(room);
    }
}