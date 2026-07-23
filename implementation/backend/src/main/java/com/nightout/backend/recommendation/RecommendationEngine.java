package com.nightout.backend.recommendation;

import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class RecommendationEngine {

    private final List<RecommendationStrategy> strategies;

    public RecommendationEngine(
            List<RecommendationStrategy> strategies
    ) {
        this.strategies = List.copyOf(strategies);
    }

    public RecommendationScore evaluate(
            RecommendationContext context
    ) {
        List<RecommendationStrategy.RecommendationResult>
                contributions =
                strategies
                        .stream()
                        .map(
                                strategy ->
                                        strategy.evaluate(context)
                        )
                        .filter(
                                RecommendationStrategy
                                        .RecommendationResult
                                        ::contributes
                        )
                        .sorted(
                                Comparator
                                        .comparingInt(
                                                RecommendationStrategy
                                                        .RecommendationResult
                                                        ::score
                                        )
                                        .reversed()
                        )
                        .toList();

        int totalScore =
                contributions
                        .stream()
                        .mapToInt(
                                RecommendationStrategy
                                        .RecommendationResult
                                        ::score
                        )
                        .sum();

        return new RecommendationScore(
                totalScore,
                contributions
        );
    }

    public record RecommendationScore(
            int totalScore,
            List<
                    RecommendationStrategy
                            .RecommendationResult
                    > contributions
    ) {

        public RecommendationScore {
            if (totalScore < 0) {
                throw new IllegalArgumentException(
                        "Total recommendation score cannot be negative"
                );
            }

            contributions =
                    contributions == null
                            ? List.of()
                            : List.copyOf(contributions);
        }

        public List<String> reasons() {
            return contributions
                    .stream()
                    .map(
                            RecommendationStrategy
                                    .RecommendationResult
                                    ::reason
                    )
                    .filter(
                            reason ->
                                    reason != null
                                            && !reason.isBlank()
                    )
                    .toList();
        }
    }
}