package com.nightout.backend.recommendation;

import org.springframework.stereotype.Component;

@Component
public class FriendsAttendingStrategy
        implements RecommendationStrategy {

    private static final int MAX_SCORE = 25;

    @Override
    public RecommendationResult evaluate(
            RecommendationContext context
    ) {
        long friendsAttending =
                context.friendsAttending();

        if (friendsAttending <= 0) {
            return noContribution();
        }

        return new RecommendationResult(
                "Friends attending",
                calculateScore(friendsAttending),
                buildReason(friendsAttending)
        );
    }

    private int calculateScore(
            long friendsAttending
    ) {
        if (friendsAttending >= 3) {
            return MAX_SCORE;
        }

        if (friendsAttending == 2) {
            return 18;
        }

        return 12;
    }

    private String buildReason(
            long friendsAttending
    ) {
        if (friendsAttending == 1) {
            return "One of your friends is attending";
        }

        return friendsAttending
                + " of your friends are attending";
    }

    private RecommendationResult noContribution() {
        return new RecommendationResult(
                "Friends attending",
                0,
                ""
        );
    }
}