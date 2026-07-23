package com.nightout.backend.recommendation;

import com.nightout.backend.entity.MusicGenre;
import org.springframework.stereotype.Component;

@Component
public class SavedEventsStrategy
        implements RecommendationStrategy {

    private static final int MAX_SCORE = 20;

    @Override
    public RecommendationResult evaluate(
            RecommendationContext context
    ) {
        long savedEvents =
                context.savedEventsWithSameGenre();

        if (savedEvents <= 0) {
            return noContribution();
        }

        int score = calculateScore(savedEvents);

        return new RecommendationResult(
                "Saved events",
                score,
                buildReason(
                        savedEvents,
                        context.event().getMusicGenre()
                )
        );
    }

    private int calculateScore(
            long savedEvents
    ) {
        if (savedEvents >= 3) {
            return MAX_SCORE;
        }

        if (savedEvents == 2) {
            return 14;
        }

        return 8;
    }

    private String buildReason(
            long savedEvents,
            MusicGenre genre
    ) {
        String readableGenre =
                readableGenre(genre);

        if (savedEvents == 1) {
            return "You saved another "
                    + readableGenre
                    + " event";
        }

        return "You saved "
                + savedEvents
                + " other "
                + readableGenre
                + " events";
    }

    private RecommendationResult noContribution() {
        return new RecommendationResult(
                "Saved events",
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