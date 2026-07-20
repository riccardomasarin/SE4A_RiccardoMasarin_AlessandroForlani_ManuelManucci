package com.nightout.backend.service;

import com.nightout.backend.dto.CreateEventDto;
import com.nightout.backend.dto.EventDetailDto;
import com.nightout.backend.dto.UpdateEventDto;
import com.nightout.backend.dto.UpdateVenueRequest;
import com.nightout.backend.dto.VenueDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.mediator.VenueManagementDataMediator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VenueManagementService {

    private final VenueManagementDataMediator dataMediator;

    private final NightOutMapper mapper;

    public VenueManagementService(
            VenueManagementDataMediator dataMediator,
            NightOutMapper mapper
    ) {
        this.dataMediator = dataMediator;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<VenueDto> getVenuesForManager(
            Long managerId
    ) {
        return dataMediator
                .findVenuesByManager(managerId)
                .stream()
                .map(mapper::toVenueDto)
                .toList();
    }

    @Transactional
    public EventDetailDto createEvent(
            CreateEventDto request
    ) {
        AppUser manager =
                dataMediator
                        .findUserById(
                                request.managerId()
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Manager not found: "
                                                        + request.managerId()
                                        )
                        );

        if (
                manager.getRole()
                        != UserRole.VENUE_MANAGER
                        && manager.getRole()
                        != UserRole.PR_MANAGER
        ) {
            throw new BadRequestException(
                    "Only a manager or PR user can create events in this demo."
            );
        }

        Venue venue =
                dataMediator
                        .findVenueById(
                                request.venueId()
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Venue not found: "
                                                        + request.venueId()
                                        )
                        );

        Event event =
                new Event(
                        request.title(),
                        request.description(),
                        venue,
                        request.startsAt(),
                        request.endsAt(),
                        request.musicGenre(),
                        request.dressCode(),
                        request.ageRestriction(),
                        request.entryCondition(),
                        request.price(),
                        request.vipPrice(),
                        request.capacity(),
                        50,
                        false,
                        request.imageUrl(),
                        manager
                );

        event.setAtmosphereScore(
                70
        );

        event.setMusicScore(
                75
        );

        event.setDrinkScore(
                65
        );

        event.setLineScore(
                50
        );

        Event savedEvent =
                dataMediator.saveEvent(
                        event
                );

        return mapper.toEventDetailDto(
                savedEvent
        );
    }

    @Transactional(readOnly = true)
    public List<EventDetailDto> getEventsForManager(
            Long managerId
    ) {
        AppUser manager =
                dataMediator
                        .findUserById(managerId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Manager not found: "
                                                        + managerId
                                        )
                        );

        if (
                manager.getRole()
                        != UserRole.VENUE_MANAGER
                        && manager.getRole()
                        != UserRole.PR_MANAGER
        ) {
            throw new BadRequestException(
                    "Only a manager or PR user can view managed events."
            );
        }

        return dataMediator
                .findEventsByCreator(managerId)
                .stream()
                .map(mapper::toEventDetailDto)
                .toList();
    }

    @Transactional
    public EventDetailDto updateEvent(
            Long eventId,
            UpdateEventDto request
    ) {
        Event event =
                dataMediator
                        .findEventById(eventId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Event not found: "
                                                        + eventId
                                        )
                        );

        if (
                event.getCreatedBy() == null
                        || !event.getCreatedBy()
                                .getId()
                                .equals(
                                        request.managerId()
                                )
        ) {
            throw new BadRequestException(
                    "Only the creator can update this event."
            );
        }

        Venue venue =
                dataMediator
                        .findVenueById(
                                request.venueId()
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Venue not found: "
                                                        + request.venueId()
                                        )
                        );

        event.setTitle(
                request.title()
        );

        event.setDescription(
                request.description()
        );

        event.setVenue(
                venue
        );

        event.setStartsAt(
                request.startsAt()
        );

        event.setEndsAt(
                request.endsAt()
        );

        event.setMusicGenre(
                request.musicGenre()
        );

        event.setDressCode(
                request.dressCode()
        );

        event.setAgeRestriction(
                request.ageRestriction()
        );

        event.setEntryCondition(
                request.entryCondition()
        );

        event.setPrice(
                request.price()
        );

        event.setVipPrice(
                request.vipPrice()
        );

        event.setCapacity(
                request.capacity()
        );

        event.setImageUrl(
                request.imageUrl()
        );

        Event savedEvent =
                dataMediator.saveEvent(
                        event
                );

        return mapper.toEventDetailDto(
                savedEvent
        );
    }

    @Transactional
    public void deleteEvent(
            Long eventId,
            Long managerId
    ) {
        Event event =
                dataMediator
                        .findEventById(eventId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Event not found: "
                                                        + eventId
                                        )
                        );

        if (
                event.getCreatedBy() == null
                        || !event.getCreatedBy()
                                .getId()
                                .equals(managerId)
        ) {
            throw new BadRequestException(
                    "Only the creator can delete this event."
            );
        }

        dataMediator.deleteEvent(
                event
        );
    }

    @Transactional
    public VenueDto updateVenue(
            Long venueId,
            UpdateVenueRequest request
    ) {
        AppUser manager =
                dataMediator
                        .findUserById(
                                request.managerId()
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Manager not found: "
                                                        + request.managerId()
                                        )
                        );

        if (
                manager.getRole()
                        != UserRole.VENUE_MANAGER
                        && manager.getRole()
                        != UserRole.PR_MANAGER
        ) {
            throw new BadRequestException(
                    "Only a venue manager or PR user can update a venue."
            );
        }

        Venue venue =
                dataMediator
                        .findVenueById(
                                venueId
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Venue not found: "
                                                        + venueId
                                        )
                        );

        if (
                venue.getManager() == null
                        || !venue.getManager()
                                .getId()
                                .equals(
                                        request.managerId()
                                )
        ) {
            throw new BadRequestException(
                    "This venue is not managed by the selected user."
            );
        }

        venue.setName(
                request.name().trim()
        );

        venue.setCategory(
                request.category()
        );

        venue.setAddress(
                request.address().trim()
        );

        venue.setCity(
                request.city().trim()
        );

        venue.setArea(
                request.area().trim()
        );

        venue.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );

        venue.setImageUrl(
                normalizeOptionalText(
                        request.imageUrl()
                )
        );

        venue.setPhoneNumber(
                normalizeOptionalText(
                        request.phoneNumber()
                )
        );

        venue.setContactEmail(
                normalizeOptionalText(
                        request.contactEmail()
                )
        );

        venue.setWebsiteUrl(
                normalizeOptionalText(
                        request.websiteUrl()
                )
        );

        venue.setInstagramUrl(
                normalizeOptionalText(
                        request.instagramUrl()
                )
        );

        venue.setFacebookUrl(
                normalizeOptionalText(
                        request.facebookUrl()
                )
        );

        venue.setTiktokUrl(
                normalizeOptionalText(
                        request.tiktokUrl()
                )
        );

        Venue savedVenue =
                dataMediator.saveVenue(
                        venue
                );

        return mapper.toVenueDto(
                savedVenue
        );
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}