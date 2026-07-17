package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.Promotion;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.PromotionRepository;
import com.nightout.backend.repository.VenueRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class PromotionDataMediator {

    private final PromotionRepository promotionRepository;

    private final VenueRepository venueRepository;

    private final EventRepository eventRepository;

    private final AppUserRepository userRepository;

    public PromotionDataMediator(
            PromotionRepository promotionRepository,
            VenueRepository venueRepository,
            EventRepository eventRepository,
            AppUserRepository userRepository
    ) {
        this.promotionRepository = promotionRepository;
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

    public Optional<Event> findEventById(
            Long eventId
    ) {
        return eventRepository.findById(eventId);
    }

    public Optional<Promotion> findPromotionById(
            Long promotionId
    ) {
        return promotionRepository.findById(
                promotionId
        );
    }

    public List<Promotion> findPromotionsForVenue(
            Long venueId
    ) {
        return promotionRepository
                .findByVenueIdOrderByValidFromDesc(
                        venueId
                );
    }

    public List<Promotion> findActivePromotionsForVenue(
            Long venueId,
            LocalDateTime currentTime
    ) {
        return promotionRepository
                .findCurrentlyActiveByVenueId(
                        venueId,
                        currentTime
                );
    }

    public Promotion savePromotion(
            Promotion promotion
    ) {
        return promotionRepository.save(
                promotion
        );
    }

    public void deletePromotion(
            Promotion promotion
    ) {
        promotionRepository.delete(
                promotion
        );
    }
}