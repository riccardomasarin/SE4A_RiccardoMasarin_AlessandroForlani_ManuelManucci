package com.nightout.backend.controller;

import com.nightout.backend.dto.RecommendedEventDto;
import com.nightout.backend.service.RecommendationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService
    ) {
        this.recommendationService =
                recommendationService;
    }

    @GetMapping("/users/{userId}")
    public List<RecommendedEventDto> getRecommendations(
            @PathVariable
            Long userId,

            @RequestParam(required = false)
            Integer limit
    ) {
        return recommendationService
                .getRecommendations(
                        userId,
                        limit
                );
    }
}