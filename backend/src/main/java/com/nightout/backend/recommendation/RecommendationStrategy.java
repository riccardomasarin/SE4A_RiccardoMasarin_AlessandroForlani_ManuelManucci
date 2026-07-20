package com.nightout.backend.recommendation;

public interface RecommendationStrategy {

    RecommendationResult evaluate(
            RecommendationContext context
    );

    record RecommendationResult(
            String strategyName,
            int score,
            String reason
    ) {

        public RecommendationResult {
            if (strategyName == null
                    || strategyName.isBlank()) {
                throw new IllegalArgumentException(
                        "Strategy name cannot be empty"
                );
            }

            if (score < 0) {
                throw new IllegalArgumentException(
                        "Recommendation score cannot be negative"
                );
            }

            reason = reason == null
                    ? ""
                    : reason;
        }

        public boolean contributes() {
            return score > 0;
        }
    }
}