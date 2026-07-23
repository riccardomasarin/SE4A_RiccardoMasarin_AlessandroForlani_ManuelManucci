package com.nightout.backend.service;

import com.nightout.backend.dto.RecommendedEventDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.mediator.RecommendationDataMediator;
import com.nightout.backend.recommendation.RecommendationContext;
import com.nightout.backend.recommendation.RecommendationEngine;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecommendationService {

    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_LIMIT = 20;

    private final RecommendationDataMediator dataMediator;
    private final RecommendationEngine recommendationEngine;
    private final GeographicDistanceService distanceService;
    private final NightOutMapper mapper;

    public RecommendationService(
            RecommendationDataMediator dataMediator,
            RecommendationEngine recommendationEngine,
            GeographicDistanceService distanceService,
            NightOutMapper mapper
    ) {
        this.dataMediator = dataMediator;
        this.recommendationEngine =
                recommendationEngine;
        this.distanceService = distanceService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<RecommendedEventDto> getRecommendations(
            Long userId,
            Integer requestedLimit
    ) {
        AppUser user =
                dataMediator
                        .findUserById(userId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "User not found: "
                                                        + userId
                                        )
                        );

        int limit = resolveLimit(
                requestedLimit
        );

        LocalDateTime now =
                LocalDateTime.now();

        return dataMediator
                .findAllEvents()
                .stream()
                .filter(
                        event ->
                                event.getStartsAt() != null
                                        && event.getStartsAt()
                                                .isAfter(now)
                )
                .filter(
                        event ->
                                !dataMediator.hasActiveTicket(
                                        userId,
                                        event.getId()
                                )
                )
                .map(
                        event ->
                                evaluateEvent(
                                        user,
                                        event
                                )
                )
                .filter(
                        candidate ->
                                candidate.score()
                                        .totalScore() > 0
                )
                .sorted(
                        Comparator
                                .comparingInt(
                                        RecommendationCandidate
                                                ::totalScore
                                )
                                .reversed()
                                .thenComparing(
                                        candidate ->
                                                candidate.event()
                                                        .getPopularityScore(),
                                        Comparator.reverseOrder()
                                )
                                .thenComparing(
                                        candidate ->
                                                candidate.event()
                                                        .getStartsAt()
                                )
                )
                .limit(limit)
                .map(
                        candidate ->
                                toDto(
                                        candidate,
                                        user
                                )
                )
                .toList();
    }

    private RecommendationCandidate evaluateEvent(
            AppUser user,
            Event event
    ) {
        Double distanceKm =
                distanceService.calculateDistance(
                        user,
                        event.getVenue()
                );

        long savedEventsWithSameGenre =
                dataMediator
                        .countSavedEventsWithSameGenre(
                                user.getId(),
                                event
                        );

        long confirmedTicketsWithSameGenre =
                dataMediator
                        .countConfirmedTicketsWithSameGenre(
                                user.getId(),
                                event
                        );

        long friendsAttending =
                dataMediator
                        .countFriendsAttending(
                                user.getId(),
                                event.getId()
                        );

        RecommendationContext context =
                new RecommendationContext(
                        user,
                        event,
                        distanceKm,
                        savedEventsWithSameGenre,
                        confirmedTicketsWithSameGenre,
                        friendsAttending
                );

        RecommendationEngine.RecommendationScore score =
                recommendationEngine.evaluate(
                        context
                );

        return new RecommendationCandidate(
                event,
                score
        );
    }

    private RecommendedEventDto toDto(
            RecommendationCandidate candidate,
            AppUser user
    ) {
        return new RecommendedEventDto(
                mapper.toEventSummaryDto(
                        candidate.event(),
                        user
                ),
                candidate.score().totalScore(),
                candidate.score().reasons()
        );
    }

    private int resolveLimit(
            Integer requestedLimit
    ) {
        if (requestedLimit == null) {
            return DEFAULT_LIMIT;
        }

        if (requestedLimit < 1) {
            return 1;
        }

        return Math.min(
                requestedLimit,
                MAX_LIMIT
        );
    }

    private record RecommendationCandidate(
            Event event,
            RecommendationEngine
                    .RecommendationScore score
    ) {

        private int totalScore() {
            return score.totalScore();
        }
    }
}