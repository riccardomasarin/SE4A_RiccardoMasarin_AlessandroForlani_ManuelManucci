package com.nightout.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private VenueCategory category;

    private String address;
    private String city;
    private String area;
    private String description;
    private boolean partnerBar;
    private double rating;
    private String imageUrl;

    @ManyToOne
    private AppUser manager;

    public Venue() {
    }

    public Venue(String name, VenueCategory category, String address, String city, String area, String description,
            boolean partnerBar, double rating, String imageUrl, AppUser manager) {
        this.name = name;
        this.category = category;
        this.address = address;
        this.city = city;
        this.area = area;
        this.description = description;
        this.partnerBar = partnerBar;
        this.rating = rating;
        this.imageUrl = imageUrl;
        this.manager = manager;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VenueCategory getCategory() {
        return category;
    }

    public void setCategory(VenueCategory category) {
        this.category = category;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isPartnerBar() {
        return partnerBar;
    }

    public void setPartnerBar(boolean partnerBar) {
        this.partnerBar = partnerBar;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public AppUser getManager() {
        return manager;
    }

    public void setManager(AppUser manager) {
        this.manager = manager;
    }
}
