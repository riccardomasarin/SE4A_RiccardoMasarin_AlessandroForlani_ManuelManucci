package com.nightout.backend.dto;

import java.util.List;

public record RecommendedEventDto(
        EventSummaryDto event,
        int score,
        List<String> reasons
) {

    public RecommendedEventDto {
        if (event == null) {
            throw new IllegalArgumentException(
                    "Recommended event cannot be null"
            );
        }

        if (score < 0) {
            throw new IllegalArgumentException(
                    "Recommendation score cannot be negative"
            );
        }

        reasons = reasons == null
                ? List.of()
                : List.copyOf(reasons);
    }
}