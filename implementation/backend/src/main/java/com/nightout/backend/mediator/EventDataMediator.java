package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.ReturnTransportOption;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.ReturnTransportOptionRepository;
import com.nightout.backend.repository.VenueRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class EventDataMediator {

    private final EventRepository eventRepository;

    private final VenueRepository venueRepository;

    private final ReturnTransportOptionRepository
            transportRepository;

    private final AppUserRepository userRepository;

    public EventDataMediator(
            EventRepository eventRepository,
            VenueRepository venueRepository,
            ReturnTransportOptionRepository
                    transportRepository,
            AppUserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.transportRepository =
                transportRepository;
        this.userRepository = userRepository;
    }

    public List<Event> findAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> findEventById(
            Long eventId
    ) {
        return eventRepository.findById(eventId);
    }

    public Optional<AppUser> findUserById(
            Long userId
    ) {
        return userRepository.findById(userId);
    }

    public List<Venue> findPartnerBars() {
        return venueRepository
                .findByPartnerBarTrue();
    }

    public List<ReturnTransportOption>
            findTransportForEvent(
                    Long eventId
            ) {
        return transportRepository
                .findByEventId(eventId);
    }
}