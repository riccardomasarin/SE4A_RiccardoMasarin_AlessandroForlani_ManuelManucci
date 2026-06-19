package com.nightout.backend.controller;

import com.nightout.backend.dto.EventDetailDto;
import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.ReturnTransportDto;
import com.nightout.backend.dto.VenueDto;
import com.nightout.backend.entity.MusicGenre;
import com.nightout.backend.entity.VenueCategory;
import com.nightout.backend.service.EventService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/events")
    public List<EventSummaryDto> getEvents(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) MusicGenre genre,
            @RequestParam(required = false) VenueCategory venueCategory,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String entryCondition,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false, defaultValue = "date") String sort
    ) {
        return eventService.findEvents(city, area, genre, venueCategory, date, fromDate, toDate, minPrice, maxPrice,
                entryCondition, search, featured, sort);
    }

    @GetMapping("/events/popular")
    public List<EventSummaryDto> getPopularEvents() {
        return eventService.popularEvents();
    }

    @GetMapping("/events/{eventId}")
    public EventDetailDto getEvent(@PathVariable Long eventId) {
        return eventService.getEvent(eventId);
    }

    @GetMapping("/events/{eventId}/return-transport")
    public List<ReturnTransportDto> getReturnTransport(@PathVariable Long eventId) {
        return eventService.findTransportForEvent(eventId);
    }

    @GetMapping("/partner-bars")
    public List<VenueDto> getPartnerBars() {
        return eventService.findPartnerBars();
    }
}
