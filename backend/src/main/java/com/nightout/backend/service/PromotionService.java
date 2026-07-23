package com.nightout.backend.service;

import com.nightout.backend.dto.CreatePromotionDto;
import com.nightout.backend.dto.PromotionDto;
import com.nightout.backend.dto.UpdatePromotionDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.Promotion;
import com.nightout.backend.entity.PromotionType;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.mediator.PromotionDataMediator;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PromotionService {

    private final PromotionDataMediator promotionDataMediator;

    private final NightOutMapper mapper;

    public PromotionService(
            PromotionDataMediator promotionDataMediator,
            NightOutMapper mapper
    ) {
        this.promotionDataMediator =
                promotionDataMediator;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<PromotionDto> getPromotionsForVenue(
            Long venueId,
            Long managerId
    ) {
        validateManager(managerId);

        Venue venue = getManagedVenue(
                venueId,
                managerId
        );

        return promotionDataMediator
                .findPromotionsForVenue(
                        venue.getId()
                )
                .stream()
                .map(mapper::toPromotionDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PromotionDto> getCurrentlyActivePromotions(
            Long venueId
    ) {
        promotionDataMediator
                .findVenueById(venueId)
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "Venue not found: "
                                                + venueId
                                )
                );

        return promotionDataMediator
                .findActivePromotionsForVenue(
                        venueId,
                        LocalDateTime.now()
                )
                .stream()
                .map(mapper::toPromotionDto)
                .toList();
    }

    @Transactional
    public PromotionDto createPromotion(
            CreatePromotionDto request
    ) {
        validateManager(
                request.managerId()
        );

        Venue venue = getManagedVenue(
                request.venueId(),
                request.managerId()
        );

        validateDates(
                request.validFrom(),
                request.validTo()
        );

        validatePromotionFields(
                request.type(),
                request.promoCode(),
                request.discountPercentage()
        );

        Event event = resolveEvent(
                request.eventId(),
                venue
        );

        Promotion promotion =
                new Promotion();

        promotion.setVenue(venue);
        promotion.setEvent(event);
        promotion.setLabel(
                request.label().trim()
        );

        promotion.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );

        promotion.setType(
                request.type()
        );

        promotion.setPromoCode(
                normalizePromoCode(
                        request.type(),
                        request.promoCode()
                )
        );

        promotion.setDiscountPercentage(
                normalizeDiscountPercentage(
                        request.type(),
                        request.discountPercentage()
                )
        );

        promotion.setActive(
                request.active() == null
                        || request.active()
        );

        promotion.setValidFrom(
                request.validFrom()
        );

        promotion.setValidTo(
                request.validTo()
        );

        Promotion savedPromotion =
                promotionDataMediator
                        .savePromotion(
                                promotion
                        );

        return mapper.toPromotionDto(
                savedPromotion
        );
    }

    @Transactional
    public PromotionDto updatePromotion(
            Long promotionId,
            UpdatePromotionDto request
    ) {
        validateManager(
                request.managerId()
        );

        Promotion promotion =
                promotionDataMediator
                        .findPromotionById(
                                promotionId
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Promotion not found: "
                                                        + promotionId
                                        )
                        );

        Venue venue =
                promotion.getVenue();

        if (venue == null) {
            throw new BadRequestException(
                    "The promotion is not associated with a venue."
            );
        }

        getManagedVenue(
                venue.getId(),
                request.managerId()
        );

        validateDates(
                request.validFrom(),
                request.validTo()
        );

        validatePromotionFields(
                request.type(),
                request.promoCode(),
                request.discountPercentage()
        );

        Event event = resolveEvent(
                request.eventId(),
                venue
        );

        promotion.setEvent(event);

        promotion.setLabel(
                request.label().trim()
        );

        promotion.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );

        promotion.setType(
                request.type()
        );

        promotion.setPromoCode(
                normalizePromoCode(
                        request.type(),
                        request.promoCode()
                )
        );

        promotion.setDiscountPercentage(
                normalizeDiscountPercentage(
                        request.type(),
                        request.discountPercentage()
                )
        );

        promotion.setActive(
                request.active()
        );

        promotion.setValidFrom(
                request.validFrom()
        );

        promotion.setValidTo(
                request.validTo()
        );

        Promotion savedPromotion =
                promotionDataMediator
                        .savePromotion(
                                promotion
                        );

        return mapper.toPromotionDto(
                savedPromotion
        );
    }

    @Transactional
    public PromotionDto setPromotionActive(
            Long promotionId,
            Long managerId,
            boolean active
    ) {
        validateManager(managerId);

        Promotion promotion =
                promotionDataMediator
                        .findPromotionById(
                                promotionId
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Promotion not found: "
                                                        + promotionId
                                        )
                        );

        Venue venue =
                promotion.getVenue();

        if (venue == null) {
            throw new BadRequestException(
                    "The promotion is not associated with a venue."
            );
        }

        getManagedVenue(
                venue.getId(),
                managerId
        );

        promotion.setActive(active);

        Promotion savedPromotion =
                promotionDataMediator
                        .savePromotion(
                                promotion
                        );

        return mapper.toPromotionDto(
                savedPromotion
        );
    }

    @Transactional
    public void deletePromotion(
            Long promotionId,
            Long managerId
    ) {
        validateManager(managerId);

        Promotion promotion =
                promotionDataMediator
                        .findPromotionById(
                                promotionId
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Promotion not found: "
                                                        + promotionId
                                        )
                        );

        Venue venue =
                promotion.getVenue();

        if (venue == null) {
            throw new BadRequestException(
                    "The promotion is not associated with a venue."
            );
        }

        getManagedVenue(
                venue.getId(),
                managerId
        );

        promotionDataMediator
                .deletePromotion(
                        promotion
                );
    }

    private AppUser validateManager(
            Long managerId
    ) {
        AppUser manager =
                promotionDataMediator
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
                    "Only a venue manager or PR user can manage promotions."
            );
        }

        return manager;
    }

    private Venue getManagedVenue(
            Long venueId,
            Long managerId
    ) {
        Venue venue =
                promotionDataMediator
                        .findVenueById(venueId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Venue not found: "
                                                        + venueId
                                        )
                        );

        boolean managedByUser =
                promotionDataMediator
                        .findVenuesByManager(
                                managerId
                        )
                        .stream()
                        .anyMatch(
                                managedVenue ->
                                        managedVenue
                                                .getId()
                                                .equals(
                                                        venueId
                                                )
                        );

        if (!managedByUser) {
            throw new BadRequestException(
                    "The selected venue is not managed by this user."
            );
        }

        return venue;
    }

    private Event resolveEvent(
            Long eventId,
            Venue venue
    ) {
        if (eventId == null) {
            return null;
        }

        Event event =
                promotionDataMediator
                        .findEventById(eventId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Event not found: "
                                                        + eventId
                                        )
                        );

        if (
                event.getVenue() == null
                        || !event.getVenue()
                                .getId()
                                .equals(
                                        venue.getId()
                                )
        ) {
            throw new BadRequestException(
                    "The selected event does not belong to this venue."
            );
        }

        return event;
    }

    private void validateDates(
            LocalDateTime validFrom,
            LocalDateTime validTo
    ) {
        if (
                validFrom != null
                        && validTo != null
                        && validTo.isBefore(
                                validFrom
                        )
        ) {
            throw new BadRequestException(
                    "The promotion end date cannot be before the start date."
            );
        }
    }

    private void validatePromotionFields(
            PromotionType type,
            String promoCode,
            Integer discountPercentage
    ) {
        if (type == null) {
            throw new BadRequestException(
                    "Promotion type is required."
            );
        }

        if (
                discountPercentage != null
                        && (
                        discountPercentage < 1
                                || discountPercentage > 100
                )
        ) {
            throw new BadRequestException(
                    "Discount percentage must be between 1 and 100."
            );
        }

        if (
                type == PromotionType.DISCOUNT
                        && discountPercentage == null
        ) {
            throw new BadRequestException(
                    "A discount promotion requires a percentage."
            );
        }

        if (
                type == PromotionType.PROMO_CODE
                        && (
                        promoCode == null
                                || promoCode.isBlank()
                )
        ) {
            throw new BadRequestException(
                    "A promo-code promotion requires a promo code."
            );
        }
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

    private String normalizePromoCode(
            PromotionType type,
            String promoCode
    ) {
        if (
                type != PromotionType.PROMO_CODE
        ) {
            return null;
        }

        return promoCode
                .trim()
                .toUpperCase();
    }

    private Integer normalizeDiscountPercentage(
            PromotionType type,
            Integer discountPercentage
    ) {
        if (
                type != PromotionType.DISCOUNT
                        && type
                        != PromotionType.PROMO_CODE
        ) {
            return null;
        }

        return discountPercentage;
    }
}