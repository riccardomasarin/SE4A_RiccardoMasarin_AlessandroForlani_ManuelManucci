package com.nightout.backend.recommendation;

import com.nightout.backend.entity.MusicGenre;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class MusicPreferenceStrategy
        implements RecommendationStrategy {

    private static final int MATCH_SCORE = 30;

    @Override
    public RecommendationResult evaluate(
            RecommendationContext context
    ) {
        MusicGenre eventGenre =
                context.event().getMusicGenre();

        if (eventGenre == null
                || context.user()
                        .getMusicPreferences() == null) {
            return noContribution();
        }

        String normalizedEventGenre =
                normalize(eventGenre.name());

        boolean matchesPreference =
                context.user()
                        .getMusicPreferences()
                        .stream()
                        .map(this::normalize)
                        .anyMatch(
                                preference ->
                                        preference.equals(
                                                normalizedEventGenre
                                        )
                        );

        if (!matchesPreference) {
            return noContribution();
        }

        return new RecommendationResult(
                "Music preference",
                MATCH_SCORE,
                "Matches your "
                        + readableGenre(eventGenre)
                        + " preference"
        );
    }

    private RecommendationResult noContribution() {
        return new RecommendationResult(
                "Music preference",
                0,
                ""
        );
    }

    private String normalize(
            String value
    ) {
        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toLowerCase(Locale.ROOT)
                .replace("&", "n")
                .replaceAll("[^a-z0-9]", "");
    }

    private String readableGenre(
            MusicGenre genre
    ) {
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