package com.nightout.backend.service;

import com.nightout.backend.dto.EventDetailDto;
import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.NotificationDto;
import com.nightout.backend.dto.PregameRoomDto;
import com.nightout.backend.dto.PromotionDto;
import com.nightout.backend.dto.ReturnTransportDto;
import com.nightout.backend.dto.SalesChannelDto;
import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.dto.UserDto;
import com.nightout.backend.dto.VenueDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.PrEventAssignment;
import com.nightout.backend.entity.PregameRoom;
import com.nightout.backend.entity.Promotion;
import com.nightout.backend.entity.ReturnTransportOption;
import com.nightout.backend.entity.SalesChannel;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.entity.UserNotification;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.repository.PregameRoomRepository;
import com.nightout.backend.repository.PromotionRepository;
import com.nightout.backend.repository.ReturnTransportOptionRepository;
import com.nightout.backend.repository.TicketRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class NightOutMapper {

    private final TicketRepository ticketRepository;
    private final PromotionRepository promotionRepository;
    private final PregameRoomRepository pregameRoomRepository;
    private final ReturnTransportOptionRepository transportRepository;
    private final GeographicDistanceService geographicDistanceService;

    public NightOutMapper(
            TicketRepository ticketRepository,
            PromotionRepository promotionRepository,
            PregameRoomRepository pregameRoomRepository,
            ReturnTransportOptionRepository transportRepository,
            GeographicDistanceService geographicDistanceService
    ) {
        this.ticketRepository = ticketRepository;
        this.promotionRepository = promotionRepository;
        this.pregameRoomRepository = pregameRoomRepository;
        this.transportRepository = transportRepository;
        this.geographicDistanceService =
                geographicDistanceService;
    }

    public UserDto toUserDto(
            AppUser user
    ) {
        List<String> preferences =
                user.getMusicPreferences() == null
                        ? List.of()
                        : user.getMusicPreferences()
                                .stream()
                                .toList();

        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCity(),
                user.isVerified(),
                user.getPoints(),
                user.getAvatarUrl(),
                preferences
        );
    }

    public VenueDto toVenueDto(
            Venue venue
    ) {
        return new VenueDto(
                venue.getId(),
                venue.getName(),
                venue.getCategory(),
                venue.getAddress(),
                venue.getCity(),
                venue.getArea(),
                venue.getDescription(),
                venue.isPartnerBar(),
                venue.getRating(),
                venue.getImageUrl(),
                venue.getPhoneNumber(),
                venue.getContactEmail(),
                venue.getWebsiteUrl(),
                venue.getInstagramUrl(),
                venue.getFacebookUrl(),
                venue.getTiktokUrl()
        );
    }

    /*
     * Versione mantenuta per i punti dell'applicazione
     * nei quali non è disponibile un utente.
     */
    public EventSummaryDto toEventSummaryDto(
            Event event
    ) {
        return toEventSummaryDto(
                event,
                null
        );
    }

    /*
     * Versione personalizzata che calcola la distanza
     * tra l'utente e il locale dell'evento.
     */
    public EventSummaryDto toEventSummaryDto(
            Event event,
            AppUser user
    ) {
        long confirmedTickets =
                ticketRepository
                        .countByEventIdAndStatus(
                                event.getId(),
                                TicketStatus.CONFIRMED
                        );

        int availableSpots =
                Math.max(
                        0,
                        event.getCapacity()
                                - (int) confirmedTickets
                );

        List<String> promotions =
                promotionRepository
                        .findCurrentlyActiveByEventId(
                                event.getId(),
                                LocalDateTime.now()
                        )
                        .stream()
                        .map(Promotion::getLabel)
                        .toList();

        Double distanceKm =
                geographicDistanceService
                        .calculateDistance(
                                user,
                                event.getVenue()
                        );

        return new EventSummaryDto(
                event.getId(),
                event.getTitle(),
                event.getVenue().getName(),
                event.getVenue().getCity(),
                event.getVenue().getArea(),
                event.getStartsAt(),
                event.getMusicGenre(),
                event.getEntryCondition(),
                event.getPrice(),
                event.getCapacity(),
                confirmedTickets,
                availableSpots,
                distanceKm,
                event.getPopularityScore(),
                event.isFeatured(),
                event.getImageUrl(),
                promotions
        );
    }

    /*
     * Versione mantenuta per le pagine amministrative
     * che non richiedono una distanza personalizzata.
     */
    public EventDetailDto toEventDetailDto(
            Event event
    ) {
        return toEventDetailDto(
                event,
                null
        );
    }

    /*
     * Versione personalizzata del dettaglio evento.
     */
    public EventDetailDto toEventDetailDto(
            Event event,
            AppUser user
    ) {
        long confirmedTickets =
                ticketRepository
                        .countByEventIdAndStatus(
                                event.getId(),
                                TicketStatus.CONFIRMED
                        );

        int availableSpots =
                Math.max(
                        0,
                        event.getCapacity()
                                - (int) confirmedTickets
                );

        List<PromotionDto> promotions =
                promotionRepository
                        .findCurrentlyActiveByEventId(
                                event.getId(),
                                LocalDateTime.now()
                        )
                        .stream()
                        .map(this::toPromotionDto)
                        .toList();

        List<PregameRoomDto> pregames =
                pregameRoomRepository
                        .findByEventId(
                                event.getId()
                        )
                        .stream()
                        .sorted(
                                Comparator.comparing(
                                        PregameRoom::getMeetingTime
                                )
                        )
                        .map(this::toPregameRoomDto)
                        .toList();

        List<ReturnTransportDto> transport =
                transportRepository
                        .findByEventId(
                                event.getId()
                        )
                        .stream()
                        .map(this::toReturnTransportDto)
                        .toList();

        Double distanceKm =
                geographicDistanceService
                        .calculateDistance(
                                user,
                                event.getVenue()
                        );

        return new EventDetailDto(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                toVenueDto(event.getVenue()),
                event.getStartsAt(),
                event.getMusicGenre(),
                event.getDressCode(),
                event.getAgeRestriction(),
                event.getEntryCondition(),
                event.getPrice(),
                event.getVipPrice(),
                event.getCapacity(),
                confirmedTickets,
                availableSpots,
                distanceKm,
                event.getPopularityScore(),
                event.getAtmosphereScore(),
                event.getMusicScore(),
                event.getDrinkScore(),
                event.getLineScore(),
                event.isFeatured(),
                event.getImageUrl(),
                promotions,
                pregames,
                transport
        );
    }

    public TicketDto toTicketDto(
            Ticket ticket
    ) {
        Event event = ticket.getEvent();
        Venue venue = event.getVenue();

        PrEventAssignment prAssignment =
                ticket.getPrAssignment();

        return new TicketDto(
                ticket.getId(),
                ticket.getCode(),
                ticket.getUser().getId(),
                ticket.getUser().getName(),
                event.getId(),
                event.getTitle(),
                venue.getName(),
                venue.getAddress(),
                event.getStartsAt(),
                ticket.getStatus(),
                ticket.getTicketType(),
                ticket.getPricePaid(),
                ticket.getCreatedAt(),
                ticket.getSalesChannel(),
                ticket.getQrPayload(),
                prAssignment != null
                        ? prAssignment
                                .getPr()
                                .getId()
                        : null,
                prAssignment != null
                        ? prAssignment
                                .getPr()
                                .getName()
                        : null,
                ticket.getPromoCodeUsed(),
                ticket.getDiscountAmount(),
                ticket.getCommissionAmount(),
                ticket.getCheckedInAt(),
                ticket.getCheckedInAt() != null
        );
    }

    public PregameRoomDto toPregameRoomDto(
            PregameRoom room
    ) {
        List<UserDto> participants =
                room.getParticipants()
                        .stream()
                        .map(this::toUserDto)
                        .toList();

        return new PregameRoomDto(
                room.getId(),
                room.getTitle(),
                room.getEvent().getId(),
                room.getEvent().getTitle(),
                room.getHost().getId(),
                room.getHost().getName(),
                room.getMeetingLocation(),
                room.getMeetingTime(),
                room.getMaxParticipants(),
                room.getParticipants().size(),
                room.getDescription(),
                room.getImageUrl(),
                room.isOfficialPartner(),
                participants
        );
    }

    public PromotionDto toPromotionDto(
            Promotion promotion
    ) {
        Event event = promotion.getEvent();
        Venue venue = promotion.getVenue();

        return new PromotionDto(
                promotion.getId(),
                venue != null
                        ? venue.getId()
                        : null,
                venue != null
                        ? venue.getName()
                        : null,
                event != null
                        ? event.getId()
                        : null,
                event != null
                        ? event.getTitle()
                        : null,
                promotion.getLabel(),
                promotion.getDescription(),
                promotion.getType(),
                promotion.getPromoCode(),
                promotion.getDiscountPercentage(),
                promotion.isActive(),
                promotion.getValidFrom(),
                promotion.getValidTo()
        );
    }

    public NotificationDto toNotificationDto(
            UserNotification notification
    ) {
        return new NotificationDto(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    public SalesChannelDto toSalesChannelDto(
            SalesChannel channel
    ) {
        return new SalesChannelDto(
                channel.getId(),
                channel.getName(),
                channel.getChannelType(),
                channel.getTicketCount(),
                channel.getTableCount(),
                channel.getRevenue(),
                channel.getCheckins(),
                channel.getPromoLabel()
        );
    }

    public ReturnTransportDto toReturnTransportDto(
            ReturnTransportOption option
    ) {
        return new ReturnTransportDto(
                option.getId(),
                option.getProvider(),
                option.getLabel(),
                option.getPickupTime(),
                option.getPickupPoint(),
                option.getDestinationArea(),
                option.getPrice(),
                option.getStatus()
        );
    }
}