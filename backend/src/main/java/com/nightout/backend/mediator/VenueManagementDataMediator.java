package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.VenueRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class VenueManagementDataMediator {

    private final VenueRepository venueRepository;

    private final EventRepository eventRepository;

    private final AppUserRepository userRepository;

    public VenueManagementDataMediator(
            VenueRepository venueRepository,
            EventRepository eventRepository,
            AppUserRepository userRepository
    ) {
        this.venueRepository = venueRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Optional<AppUser> findUserById(
            Long userId
    ) {
        return userRepository.findById(userId);
    }

    public Optional<Venue> findVenueById(
            Long venueId
    ) {
        return venueRepository.findById(venueId);
    }

    public List<Venue> findVenuesByManager(
            Long managerId
    ) {
        return venueRepository.findByManagerId(
                managerId
        );
    }

    public Venue saveVenue(
            Venue venue
    ) {
        return venueRepository.save(venue);
    }

    public Optional<Event> findEventById(
            Long eventId
    ) {
        return eventRepository.findById(eventId);
    }

    public List<Event> findEventsByCreator(
            Long managerId
    ) {
        return eventRepository.findByCreatedById(
                managerId
        );
    }

    public Event saveEvent(
            Event event
    ) {
        return eventRepository.save(event);
    }

    public void deleteEvent(
            Event event
    ) {
        eventRepository.delete(event);
    }
}