package com.nightout.backend.recommendation;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;

public record RecommendationContext(
        AppUser user,
        Event event,
        Double distanceKm,
        long savedEventsWithSameGenre,
        long confirmedTicketsWithSameGenre,
        long friendsAttending
) {

    public RecommendationContext {
        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null"
            );
        }

        if (event == null) {
            throw new IllegalArgumentException(
                    "Event cannot be null"
            );
        }

        if (savedEventsWithSameGenre < 0) {
            throw new IllegalArgumentException(
                    "Saved events count cannot be negative"
            );
        }

        if (confirmedTicketsWithSameGenre < 0) {
            throw new IllegalArgumentException(
                    "Confirmed tickets count cannot be negative"
            );
        }

        if (friendsAttending < 0) {
            throw new IllegalArgumentException(
                    "Friends attending count cannot be negative"
            );
        }
    }
}