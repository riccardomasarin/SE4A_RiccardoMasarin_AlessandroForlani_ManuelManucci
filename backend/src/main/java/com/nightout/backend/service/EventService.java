package com.nightout.backend.service;

import com.nightout.backend.dto.EventDetailDto;
import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.ReturnTransportDto;
import com.nightout.backend.dto.VenueDto;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.MusicGenre;
import com.nightout.backend.entity.ReturnTransportOption;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.ReturnTransportOptionRepository;
import com.nightout.backend.repository.VenueRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ReturnTransportOptionRepository transportRepository;
    private final NightOutMapper mapper;

    public EventService(EventRepository eventRepository, VenueRepository venueRepository,
            ReturnTransportOptionRepository transportRepository, NightOutMapper mapper) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.transportRepository = transportRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<EventSummaryDto> findEvents(String city, String area, MusicGenre genre, Double maxPrice,
            Boolean featured, String sort) {
        return eventRepository.findAll().stream()
                .filter(event -> city == null || event.getVenue().getCity().equalsIgnoreCase(city))
                .filter(event -> area == null || event.getVenue().getArea().equalsIgnoreCase(area))
                .filter(event -> genre == null || event.getMusicGenre() == genre)
                .filter(event -> maxPrice == null || event.getPrice() <= maxPrice)
                .filter(event -> featured == null || event.isFeatured() == featured)
                .sorted(comparatorFor(sort))
                .map(mapper::toEventSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventSummaryDto> popularEvents() {
        return eventRepository.findAll().stream()
                .sorted(Comparator.comparing(Event::getPopularityScore).reversed())
                .map(mapper::toEventSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDetailDto getEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found: " + eventId));
        return mapper.toEventDetailDto(event);
    }

    @Transactional(readOnly = true)
    public List<VenueDto> findPartnerBars() {
        return venueRepository.findByPartnerBarTrue().stream()
                .map(mapper::toVenueDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReturnTransportDto> findTransportForEvent(Long eventId) {
        List<ReturnTransportOption> options = transportRepository.findByEventId(eventId);
        return options.stream().map(mapper::toReturnTransportDto).toList();
    }

    private Comparator<Event> comparatorFor(String sort) {
        if ("popularity".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Event::getPopularityScore).reversed();
        }
        if ("price".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Event::getPrice);
        }
        return Comparator.comparing(Event::getStartsAt);
    }
}
