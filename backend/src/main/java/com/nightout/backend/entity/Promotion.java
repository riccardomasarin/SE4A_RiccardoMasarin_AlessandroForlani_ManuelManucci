package com.nightout.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;

@Entity
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * L'evento è facoltativo:
     * una promozione può riguardare un evento specifico
     * oppure essere generale per tutto il locale.
     */
    @ManyToOne
    private Event event;

    /*
     * Il locale a cui appartiene la promozione.
     */
    @ManyToOne
    private Venue venue;

    private String label;

    private String description;

    @Enumerated(EnumType.STRING)
    private PromotionType type = PromotionType.SPECIAL_OFFER;

    /*
     * Facoltativo: viene usato solamente quando
     * la promozione prevede un codice promozionale.
     */
    private String promoCode;

    /*
     * Facoltativo: percentuale compresa tra 0 e 100.
     */
    private Integer discountPercentage;

    /*
     * Boolean invece di boolean permette di gestire
     * eventuali promozioni già presenti nel database.
     */
    private Boolean active = true;

    private LocalDateTime validFrom;

    private LocalDateTime validTo;

    public Promotion() {
    }

    /*
     * Manteniamo il vecchio costruttore per non rompere
     * eventuale codice già presente nel progetto.
     */
    public Promotion(
            Event event,
            Venue venue,
            String label,
            String description,
            LocalDateTime validFrom,
            LocalDateTime validTo
    ) {
        this.event = event;
        this.venue = venue;
        this.label = label;
        this.description = description;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.active = true;
        this.type = PromotionType.SPECIAL_OFFER;
    }

    public Promotion(
            Event event,
            Venue venue,
            String label,
            String description,
            PromotionType type,
            String promoCode,
            Integer discountPercentage,
            Boolean active,
            LocalDateTime validFrom,
            LocalDateTime validTo
    ) {
        this.event = event;
        this.venue = venue;
        this.label = label;
        this.description = description;
        this.type = type;
        this.promoCode = promoCode;
        this.discountPercentage = discountPercentage;
        this.active = active;
        this.validFrom = validFrom;
        this.validTo = validTo;
    }

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Venue getVenue() {
        return venue;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PromotionType getType() {
        return type;
    }

    public void setType(PromotionType type) {
        this.type = type;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(LocalDateTime validFrom) {
        this.validFrom = validFrom;
    }

    public LocalDateTime getValidTo() {
        return validTo;
    }

    public void setValidTo(LocalDateTime validTo) {
        this.validTo = validTo;
    }
}