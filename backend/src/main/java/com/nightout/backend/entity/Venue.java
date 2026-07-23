package com.nightout.backend.entity;

import jakarta.persistence.Column;
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

    private Double latitude;

    private Double longitude;

    @Column(length = 2000)
    private String description;

    private boolean partnerBar;

    private double rating;

    private String imageUrl;

    /*
     * Informazioni di contatto pubbliche del locale.
     */
    private String phoneNumber;

    private String contactEmail;

    /*
     * Sito e social del locale.
     */
    private String websiteUrl;

    private String instagramUrl;

    private String facebookUrl;

    private String tiktokUrl;

    @ManyToOne
    private AppUser manager;

    public Venue() {
    }

    /*
     * Costruttore precedente mantenuto per non rompere
     * il caricamento dei dati demo già presenti.
     */
    public Venue(
            String name,
            VenueCategory category,
            String address,
            String city,
            String area,
            String description,
            boolean partnerBar,
            double rating,
            String imageUrl,
            AppUser manager
    ) {
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

    /*
     * Nuovo costruttore con coordinate geografiche.
     */
    public Venue(
            String name,
            VenueCategory category,
            String address,
            String city,
            String area,
            Double latitude,
            Double longitude,
            String description,
            boolean partnerBar,
            double rating,
            String imageUrl,
            AppUser manager
    ) {
        this.name = name;
        this.category = category;
        this.address = address;
        this.city = city;
        this.area = area;
        this.latitude = latitude;
        this.longitude = longitude;
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

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public VenueCategory getCategory() {
        return category;
    }

    public void setCategory(
            VenueCategory category
    ) {
        this.category = category;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(
            String address
    ) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(
            String city
    ) {
        this.city = city;
    }

    public String getArea() {
        return area;
    }

    public void setArea(
            String area
    ) {
        this.area = area;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(
            Double latitude
    ) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(
            Double longitude
    ) {
        this.longitude = longitude;
    }

    public boolean hasCoordinates() {
        return latitude != null && longitude != null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public boolean isPartnerBar() {
        return partnerBar;
    }

    public void setPartnerBar(
            boolean partnerBar
    ) {
        this.partnerBar = partnerBar;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(
            double rating
    ) {
        this.rating = rating;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(
            String imageUrl
    ) {
        this.imageUrl = imageUrl;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(
            String phoneNumber
    ) {
        this.phoneNumber = phoneNumber;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(
            String contactEmail
    ) {
        this.contactEmail = contactEmail;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(
            String websiteUrl
    ) {
        this.websiteUrl = websiteUrl;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(
            String instagramUrl
    ) {
        this.instagramUrl = instagramUrl;
    }

    public String getFacebookUrl() {
        return facebookUrl;
    }

    public void setFacebookUrl(
            String facebookUrl
    ) {
        this.facebookUrl = facebookUrl;
    }

    public String getTiktokUrl() {
        return tiktokUrl;
    }

    public void setTiktokUrl(
            String tiktokUrl
    ) {
        this.tiktokUrl = tiktokUrl;
    }

    public AppUser getManager() {
        return manager;
    }

    public void setManager(
            AppUser manager
    ) {
        this.manager = manager;
    }
}