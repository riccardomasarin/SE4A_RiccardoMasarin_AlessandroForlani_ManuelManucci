package com.nightout.backend.recommendation;

import org.springframework.stereotype.Component;

@Component
public class DistanceStrategy
        implements RecommendationStrategy {

    private static final int MAX_SCORE = 20;

    @Override
    public RecommendationResult evaluate(
            RecommendationContext context
    ) {
        Double distanceKm = context.distanceKm();

        if (distanceKm == null || distanceKm < 0) {
            return noContribution();
        }

        int score = calculateScore(distanceKm);

        if (score == 0) {
            return noContribution();
        }

        return new RecommendationResult(
                "Distance",
                score,
                buildReason(distanceKm)
        );
    }

    private int calculateScore(
            double distanceKm
    ) {
        if (distanceKm <= 2.0) {
            return MAX_SCORE;
        }

        if (distanceKm <= 5.0) {
            return 14;
        }

        if (distanceKm <= 10.0) {
            return 7;
        }

        return 0;
    }

    private String buildReason(
            double distanceKm
    ) {
        return "Only "
                + formatDistance(distanceKm)
                + " km away";
    }

    private String formatDistance(
            double distanceKm
    ) {
        return distanceKm == Math.floor(distanceKm)
                ? String.valueOf((long) distanceKm)
                : String.format(
                        java.util.Locale.US,
                        "%.1f",
                        distanceKm
                );
    }

    private RecommendationResult noContribution() {
        return new RecommendationResult(
                "Distance",
                0,
                ""
        );
    }
}