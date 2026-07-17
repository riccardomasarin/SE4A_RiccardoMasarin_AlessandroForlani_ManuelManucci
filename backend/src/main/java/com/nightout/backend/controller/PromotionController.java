package com.nightout.backend.controller;

import com.nightout.backend.dto.CreatePromotionDto;
import com.nightout.backend.dto.PromotionDto;
import com.nightout.backend.dto.UpdatePromotionDto;
import com.nightout.backend.service.PromotionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(
            PromotionService promotionService
    ) {
        this.promotionService = promotionService;
    }

    /*
     * Restituisce tutte le promozioni di un locale al manager,
     * comprese quelle disattivate, future o scadute.
     *
     * Esempio:
     * GET /api/promotions/manager?venueId=1&managerId=2
     */
    @GetMapping("/manager")
    public List<PromotionDto> getPromotionsForManager(
            @RequestParam Long venueId,
            @RequestParam Long managerId
    ) {
        return promotionService.getPromotionsForVenue(
                venueId,
                managerId
        );
    }

    /*
     * Restituisce solamente le promozioni attive
     * e attualmente valide di un locale.
     *
     * Esempio:
     * GET /api/promotions/active?venueId=1
     */
    @GetMapping("/active")
    public List<PromotionDto> getActivePromotions(
            @RequestParam Long venueId
    ) {
        return promotionService.getCurrentlyActivePromotions(
                venueId
        );
    }

    /*
     * Crea una nuova promozione.
     *
     * POST /api/promotions
     */
    @PostMapping
    public PromotionDto createPromotion(
            @Valid @RequestBody CreatePromotionDto request
    ) {
        return promotionService.createPromotion(request);
    }

    /*
     * Modifica completamente una promozione esistente.
     *
     * PUT /api/promotions/5
     */
    @PutMapping("/{promotionId}")
    public PromotionDto updatePromotion(
            @PathVariable Long promotionId,
            @Valid @RequestBody UpdatePromotionDto request
    ) {
        return promotionService.updatePromotion(
                promotionId,
                request
        );
    }

    /*
     * Attiva o disattiva rapidamente una promozione.
     *
     * PATCH /api/promotions/5/status?managerId=2&active=false
     */
    @PatchMapping("/{promotionId}/status")
    public PromotionDto setPromotionStatus(
            @PathVariable Long promotionId,
            @RequestParam Long managerId,
            @RequestParam boolean active
    ) {
        return promotionService.setPromotionActive(
                promotionId,
                managerId,
                active
        );
    }

    /*
     * Elimina definitivamente una promozione.
     *
     * DELETE /api/promotions/5?managerId=2
     */
    @DeleteMapping("/{promotionId}")
    public ResponseEntity<Void> deletePromotion(
            @PathVariable Long promotionId,
            @RequestParam Long managerId
    ) {
        promotionService.deletePromotion(
                promotionId,
                managerId
        );

        return ResponseEntity.noContent().build();
    }
}