package com.nightout.backend.service;

import com.nightout.backend.dto.EventDetailDto;
import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.ReturnTransportDto;
import com.nightout.backend.dto.VenueDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.MusicGenre;
import com.nightout.backend.entity.ReturnTransportOption;
import com.nightout.backend.entity.VenueCategory;
import com.nightout.backend.mediator.EventDataMediator;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {

    private final EventDataMediator eventDataMediator;

    private final NightOutMapper mapper;

    public EventService(
            EventDataMediator eventDataMediator,
            NightOutMapper mapper
    ) {
        this.eventDataMediator =
                eventDataMediator;
        this.mapper = mapper;
    }

    /*
     * Metodo mantenuto per non rompere eventuali
     * chiamate già presenti nel progetto.
     */
    @Transactional(readOnly = true)
    public List<EventSummaryDto> findEvents(
            String city,
            String area,
            MusicGenre genre,
            VenueCategory venueCategory,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate,
            Double minPrice,
            Double maxPrice,
            String entryCondition,
            String search,
            Boolean featured,
            String sort
    ) {
        return findEvents(
                city,
                area,
                genre,
                venueCategory,
                date,
                fromDate,
                toDate,
                minPrice,
                maxPrice,
                entryCondition,
                search,
                featured,
                sort,
                null
        );
    }

    /*
     * Nuova versione personalizzata con userId.
     */
    @Transactional(readOnly = true)
    public List<EventSummaryDto> findEvents(
            String city,
            String area,
            MusicGenre genre,
            VenueCategory venueCategory,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate,
            Double minPrice,
            Double maxPrice,
            String entryCondition,
            String search,
            Boolean featured,
            String sort,
            Long userId
    ) {
        String normalizedEntryCondition =
                normalize(entryCondition);

        String normalizedSearch =
                normalize(search);

        AppUser user = findOptionalUser(
                userId
        );

        return eventDataMediator
                .findAllEvents()
                .stream()
                .filter(
                        event ->
                                matchesText(
                                        event.getVenue()
                                                .getCity(),
                                        city
                                )
                )
                .filter(
                        event ->
                                matchesText(
                                        event.getVenue()
                                                .getArea(),
                                        area
                                )
                )
                .filter(
                        event ->
                                genre == null
                                        || event.getMusicGenre()
                                        == genre
                )
                .filter(
                        event ->
                                venueCategory == null
                                        || event.getVenue()
                                                .getCategory()
                                        == venueCategory
                )
                .filter(
                        event ->
                                matchesDate(
                                        event,
                                        date,
                                        fromDate,
                                        toDate
                                )
                )
                .filter(
                        event ->
                                minPrice == null
                                        || event.getPrice()
                                        >= minPrice
                )
                .filter(
                        event ->
                                maxPrice == null
                                        || event.getPrice()
                                        <= maxPrice
                )
                .filter(
                        event ->
                                normalizedEntryCondition
                                        .isBlank()
                                        || normalize(
                                        event.getEntryCondition()
                                ).contains(
                                        normalizedEntryCondition
                                )
                )
                .filter(
                        event ->
                                matchesSearch(
                                        event,
                                        normalizedSearch
                                )
                )
                .filter(
                        event ->
                                featured == null
                                        || event.isFeatured()
                                        == featured
                )
                .sorted(
                        comparatorFor(sort)
                )
                .map(
                        event ->
                                mapper.toEventSummaryDto(
                                        event,
                                        user
                                )
                )
                .toList();
    }

    /*
     * Versione precedente mantenuta.
     */
    @Transactional(readOnly = true)
    public List<EventSummaryDto> popularEvents() {
        return popularEvents(null);
    }

    /*
     * Nuova versione personalizzata.
     */
    @Transactional(readOnly = true)
    public List<EventSummaryDto> popularEvents(
            Long userId
    ) {
        AppUser user = findOptionalUser(
                userId
        );

        return eventDataMediator
                .findAllEvents()
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        Event::getPopularityScore
                                )
                                .reversed()
                )
                .map(
                        event ->
                                mapper.toEventSummaryDto(
                                        event,
                                        user
                                )
                )
                .toList();
    }

    /*
     * Versione precedente mantenuta.
     */
    @Transactional(readOnly = true)
    public EventDetailDto getEvent(
            Long eventId
    ) {
        return getEvent(
                eventId,
                null
        );
    }

    /*
     * Nuova versione personalizzata.
     */
    @Transactional(readOnly = true)
    public EventDetailDto getEvent(
            Long eventId,
            Long userId
    ) {
        Event event =
                eventDataMediator
                        .findEventById(eventId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Event not found: "
                                                        + eventId
                                        )
                        );

        AppUser user = findOptionalUser(
                userId
        );

        return mapper.toEventDetailDto(
                event,
                user
        );
    }

    @Transactional(readOnly = true)
    public List<VenueDto> findPartnerBars() {
        return eventDataMediator
                .findPartnerBars()
                .stream()
                .map(mapper::toVenueDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReturnTransportDto>
            findTransportForEvent(
                    Long eventId
            ) {
        List<ReturnTransportOption> options =
                eventDataMediator
                        .findTransportForEvent(
                                eventId
                        );

        return options
                .stream()
                .map(
                        mapper::toReturnTransportDto
                )
                .toList();
    }

    private AppUser findOptionalUser(
            Long userId
    ) {
        if (userId == null) {
            return null;
        }

        return eventDataMediator
                .findUserById(userId)
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "User not found: "
                                                + userId
                                )
                );
    }

    private Comparator<Event> comparatorFor(
            String sort
    ) {
        if (
                "popularity"
                        .equalsIgnoreCase(sort)
        ) {
            return Comparator
                    .comparing(
                            Event::getPopularityScore
                    )
                    .reversed();
        }

        if (
                "price".equalsIgnoreCase(sort)
        ) {
            return Comparator.comparing(
                    Event::getPrice
            );
        }

        return Comparator.comparing(
                Event::getStartsAt
        );
    }

    private boolean matchesDate(
            Event event,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        LocalDate eventDate =
                event.getStartsAt()
                        .toLocalDate();

        if (
                date != null
                        && !eventDate.equals(date)
        ) {
            return false;
        }

        if (
                fromDate != null
                        && eventDate.isBefore(
                                fromDate
                        )
        ) {
            return false;
        }

        return toDate == null
                || !eventDate.isAfter(toDate);
    }

    private boolean matchesSearch(
            Event event,
            String normalizedSearch
    ) {
        if (normalizedSearch.isBlank()) {
            return true;
        }

        return normalize(
                event.getTitle()
        ).contains(normalizedSearch)
                || normalize(
                event.getVenue()
                        .getName()
        ).contains(normalizedSearch);
    }

    private boolean matchesText(
            String actual,
            String expected
    ) {
        return expected == null
                || expected.isBlank()
                || actual.equalsIgnoreCase(
                expected
        );
    }

    private String normalize(
            String value
    ) {
        return value == null
                ? ""
                : value
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }
}