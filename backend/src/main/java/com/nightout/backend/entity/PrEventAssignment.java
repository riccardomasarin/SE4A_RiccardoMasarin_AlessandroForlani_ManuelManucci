package com.nightout.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "pr_event_assignment",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_pr_event_assignment_pr_event",
                        columnNames = {
                                "pr_id",
                                "event_id"
                        }
                ),
                @UniqueConstraint(
                        name = "uk_pr_event_assignment_event_code",
                        columnNames = {
                                "event_id",
                                "promo_code"
                        }
                )
        }
)
public class PrEventAssignment {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "pr_id",
            nullable = false
    )
    private AppUser pr;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "event_id",
            nullable = false
    )
    private Event event;

    @Column(
            name = "promo_code",
            nullable = false,
            length = 50
    )
    private String promoCode;

    private double discountPercentage;

    private double commissionPerTicket;

    private boolean active = true;

    private LocalDateTime createdAt =
            LocalDateTime.now();

    public PrEventAssignment() {
    }

    public PrEventAssignment(
            AppUser pr,
            Event event,
            String promoCode,
            double discountPercentage,
            double commissionPerTicket,
            boolean active,
            LocalDateTime createdAt
    ) {
        this.pr = pr;
        this.event = event;
        this.promoCode = promoCode;
        this.discountPercentage =
                discountPercentage;
        this.commissionPerTicket =
                commissionPerTicket;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public AppUser getPr() {
        return pr;
    }

    public void setPr(AppUser pr) {
        this.pr = pr;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(
            String promoCode
    ) {
        this.promoCode = promoCode;
    }

    public double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(
            double discountPercentage
    ) {
        this.discountPercentage =
                discountPercentage;
    }

    public double getCommissionPerTicket() {
        return commissionPerTicket;
    }

    public void setCommissionPerTicket(
            double commissionPerTicket
    ) {
        this.commissionPerTicket =
                commissionPerTicket;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }
}