package com.nightout.backend.recommendation;

import org.springframework.stereotype.Component;

@Component
public class PopularityStrategy
        implements RecommendationStrategy {

    private static final int MAX_SCORE = 15;

    @Override
    public RecommendationResult evaluate(
            RecommendationContext context
    ) {
        int popularityScore =
                context.event().getPopularityScore();

        int score = calculateScore(
                popularityScore
        );

        if (score == 0) {
            return noContribution();
        }

        return new RecommendationResult(
                "Popularity",
                score,
                buildReason(popularityScore)
        );
    }

    private int calculateScore(
            int popularityScore
    ) {
        if (popularityScore >= 90) {
            return MAX_SCORE;
        }

        if (popularityScore >= 75) {
            return 10;
        }

        if (popularityScore >= 60) {
            return 5;
        }

        return 0;
    }

    private String buildReason(
            int popularityScore
    ) {
        if (popularityScore >= 90) {
            return "One of the most popular events";
        }

        if (popularityScore >= 75) {
            return "Very popular with NightOut users";
        }

        return "Popular with NightOut users";
    }

    private RecommendationResult noContribution() {
        return new RecommendationResult(
                "Popularity",
                0,
                ""
        );
    }
}