package com.nightout.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;

@Entity
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private AppUser user;

    @Column(
            nullable = false,
            length = 100
    )
    private String cardholderName;

    @Column(
            nullable = false,
            length = 30
    )
    private String brand;

    @Column(
            nullable = false,
            length = 4
    )
    private String lastFourDigits;

    @Column(nullable = false)
    private int expiryMonth;

    @Column(nullable = false)
    private int expiryYear;

    @Column(nullable = false)
    private boolean defaultMethod;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public PaymentMethod() {
    }

    public PaymentMethod(
            AppUser user,
            String cardholderName,
            String brand,
            String lastFourDigits,
            int expiryMonth,
            int expiryYear,
            boolean defaultMethod
    ) {
        this.user = user;
        this.cardholderName = cardholderName;
        this.brand = brand;
        this.lastFourDigits = lastFourDigits;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this.defaultMethod = defaultMethod;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public String getCardholderName() {
        return cardholderName;
    }

    public String getBrand() {
        return brand;
    }

    public String getLastFourDigits() {
        return lastFourDigits;
    }

    public int getExpiryMonth() {
        return expiryMonth;
    }

    public int getExpiryYear() {
        return expiryYear;
    }

    public boolean isDefaultMethod() {
        return defaultMethod;
    }

    public void setDefaultMethod(
            boolean defaultMethod
    ) {
        this.defaultMethod = defaultMethod;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}