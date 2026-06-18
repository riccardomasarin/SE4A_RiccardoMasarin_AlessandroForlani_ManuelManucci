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
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @ManyToOne
    private Venue venue;

    private LocalDateTime startsAt;

    @Enumerated(EnumType.STRING)
    private MusicGenre musicGenre;

    private String dressCode;
    private String ageRestriction;
    private String entryCondition;
    private double price;
    private double vipPrice;
    private int capacity;
    private int popularityScore;
    private int atmosphereScore;
    private int musicScore;
    private int drinkScore;
    private int lineScore;
    private boolean featured;
    private String imageUrl;

    @ManyToOne
    private AppUser createdBy;

    public Event() {
    }

    public Event(String title, String description, Venue venue, LocalDateTime startsAt, MusicGenre musicGenre,
            String dressCode, String ageRestriction, String entryCondition, double price, double vipPrice,
            int capacity, int popularityScore, boolean featured, String imageUrl, AppUser createdBy) {
        this.title = title;
        this.description = description;
        this.venue = venue;
        this.startsAt = startsAt;
        this.musicGenre = musicGenre;
        this.dressCode = dressCode;
        this.ageRestriction = ageRestriction;
        this.entryCondition = entryCondition;
        this.price = price;
        this.vipPrice = vipPrice;
        this.capacity = capacity;
        this.popularityScore = popularityScore;
        this.featured = featured;
        this.imageUrl = imageUrl;
        this.createdBy = createdBy;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Venue getVenue() {
        return venue;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(LocalDateTime startsAt) {
        this.startsAt = startsAt;
    }

    public MusicGenre getMusicGenre() {
        return musicGenre;
    }

    public void setMusicGenre(MusicGenre musicGenre) {
        this.musicGenre = musicGenre;
    }

    public String getDressCode() {
        return dressCode;
    }

    public void setDressCode(String dressCode) {
        this.dressCode = dressCode;
    }

    public String getAgeRestriction() {
        return ageRestriction;
    }

    public void setAgeRestriction(String ageRestriction) {
        this.ageRestriction = ageRestriction;
    }

    public String getEntryCondition() {
        return entryCondition;
    }

    public void setEntryCondition(String entryCondition) {
        this.entryCondition = entryCondition;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getVipPrice() {
        return vipPrice;
    }

    public void setVipPrice(double vipPrice) {
        this.vipPrice = vipPrice;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(int popularityScore) {
        this.popularityScore = popularityScore;
    }

    public int getAtmosphereScore() {
        return atmosphereScore;
    }

    public void setAtmosphereScore(int atmosphereScore) {
        this.atmosphereScore = atmosphereScore;
    }

    public int getMusicScore() {
        return musicScore;
    }

    public void setMusicScore(int musicScore) {
        this.musicScore = musicScore;
    }

    public int getDrinkScore() {
        return drinkScore;
    }

    public void setDrinkScore(int drinkScore) {
        this.drinkScore = drinkScore;
    }

    public int getLineScore() {
        return lineScore;
    }

    public void setLineScore(int lineScore) {
        this.lineScore = lineScore;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public AppUser getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(AppUser createdBy) {
        this.createdBy = createdBy;
    }
}
