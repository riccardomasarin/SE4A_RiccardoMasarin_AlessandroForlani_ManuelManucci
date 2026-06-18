package com.nightout.backend.service;

import com.nightout.backend.dto.CreateEventDto;
import com.nightout.backend.dto.EventDetailDto;
import com.nightout.backend.dto.VenueDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.VenueRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VenueManagementService {

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final AppUserRepository userRepository;
    private final NightOutMapper mapper;

    public VenueManagementService(VenueRepository venueRepository, EventRepository eventRepository,
            AppUserRepository userRepository, NightOutMapper mapper) {
        this.venueRepository = venueRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<VenueDto> getVenuesForManager(Long managerId) {
        return venueRepository.findByManagerId(managerId).stream()
                .map(mapper::toVenueDto)
                .toList();
    }

    @Transactional
    public EventDetailDto createEvent(CreateEventDto request) {
        AppUser manager = userRepository.findById(request.managerId())
                .orElseThrow(() -> new NotFoundException("Manager not found: " + request.managerId()));
        if (manager.getRole() != UserRole.VENUE_MANAGER && manager.getRole() != UserRole.PR_MANAGER) {
            throw new BadRequestException("Only a manager or PR user can create events in this demo.");
        }
        Venue venue = venueRepository.findById(request.venueId())
                .orElseThrow(() -> new NotFoundException("Venue not found: " + request.venueId()));
        Event event = new Event(request.title(), request.description(), venue, request.startsAt(),
                request.musicGenre(), request.dressCode(), request.ageRestriction(), request.entryCondition(),
                request.price(), request.vipPrice(), request.capacity(), 50, false, request.imageUrl(), manager);
        event.setAtmosphereScore(70);
        event.setMusicScore(75);
        event.setDrinkScore(65);
        event.setLineScore(50);
        return mapper.toEventDetailDto(eventRepository.save(event));
    }
}
