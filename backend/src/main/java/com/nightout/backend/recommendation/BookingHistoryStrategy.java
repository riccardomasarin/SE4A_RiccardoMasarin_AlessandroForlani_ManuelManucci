package com.nightout.backend.recommendation;

import com.nightout.backend.entity.MusicGenre;
import org.springframework.stereotype.Component;

@Component
public class BookingHistoryStrategy
        implements RecommendationStrategy {

    private static final int MAX_SCORE = 20;

    @Override
    public RecommendationResult evaluate(
            RecommendationContext context
    ) {
        long confirmedBookings =
                context.confirmedTicketsWithSameGenre();

        if (confirmedBookings <= 0) {
            return noContribution();
        }

        return new RecommendationResult(
                "Booking history",
                calculateScore(confirmedBookings),
                buildReason(
                        confirmedBookings,
                        context.event().getMusicGenre()
                )
        );
    }

    private int calculateScore(
            long confirmedBookings
    ) {
        if (confirmedBookings >= 3) {
            return MAX_SCORE;
        }

        if (confirmedBookings == 2) {
            return 15;
        }

        return 10;
    }

    private String buildReason(
            long confirmedBookings,
            MusicGenre genre
    ) {
        String readableGenre =
                readableGenre(genre);

        if (confirmedBookings == 1) {
            return "You previously booked a "
                    + readableGenre
                    + " event";
        }

        return "You previously booked "
                + confirmedBookings
                + " "
                + readableGenre
                + " events";
    }

    private RecommendationResult noContribution() {
        return new RecommendationResult(
                "Booking history",
                0,
                ""
        );
    }

    private String readableGenre(
            MusicGenre genre
    ) {
        if (genre == null) {
            return "similar";
        }

        return switch (genre) {
            case HIP_HOP -> "Hip-Hop";
            case RNB -> "R&B";
            case LIVE_MUSIC -> "Live Music";
            case TECHNO -> "Techno";
            case HOUSE -> "House";
            case POP -> "Pop";
            case COMMERCIAL -> "Commercial";
            case LATIN -> "Latin";
            case ROCK -> "Rock";
        };
    }
}