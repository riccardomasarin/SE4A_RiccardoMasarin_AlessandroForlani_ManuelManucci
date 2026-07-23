package com.nightout.backend.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    /*
     * Plain-text credential used only by the academic demo login.
     * Production authentication must replace this field with a password hash.
     */
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String city;

    private Double latitude;
    private Double longitude;

    private boolean verified;
    private int points;
    private String avatarUrl;

    private boolean privateProfile = false;
    private boolean showCity = true;
    private boolean showMusicPreferences = true;
    private boolean allowPregameInvites = true;
    private boolean allowFriendRequests = true;

    @ElementCollection
    @CollectionTable(
            name = "user_music_preferences",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "music_genre")
    private Set<String> musicPreferences =
            new LinkedHashSet<>();

    public AppUser() {
    }

    public AppUser(
            String name,
            String email,
            UserRole role,
            String city,
            boolean verified,
            int points,
            String avatarUrl
    ) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.city = city;
        this.verified = verified;
        this.points = points;
        this.avatarUrl = avatarUrl;
    }

    public AppUser(
            String name,
            String email,
            UserRole role,
            String city,
            Double latitude,
            Double longitude,
            boolean verified,
            int points,
            String avatarUrl
    ) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.verified = verified;
        this.points = points;
        this.avatarUrl = avatarUrl;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password
    ) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(
            UserRole role
    ) {
        this.role = role;
    }

    public String getCity() {
        return city;
    }

    public void setCity(
            String city
    ) {
        this.city = city;
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

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(
            boolean verified
    ) {
        this.verified = verified;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(
            int points
    ) {
        this.points = points;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(
            String avatarUrl
    ) {
        this.avatarUrl = avatarUrl;
    }

    public Set<String> getMusicPreferences() {
        return musicPreferences;
    }

    public void setMusicPreferences(
            Set<String> musicPreferences
    ) {
        this.musicPreferences =
                musicPreferences == null
                        ? new LinkedHashSet<>()
                        : new LinkedHashSet<>(
                                musicPreferences
                        );
    }

    public boolean isPrivateProfile() {
        return privateProfile;
    }

    public void setPrivateProfile(
            boolean privateProfile
    ) {
        this.privateProfile = privateProfile;
    }

    public boolean isShowCity() {
        return showCity;
    }

    public void setShowCity(
            boolean showCity
    ) {
        this.showCity = showCity;
    }

    public boolean isShowMusicPreferences() {
        return showMusicPreferences;
    }

    public void setShowMusicPreferences(
            boolean showMusicPreferences
    ) {
        this.showMusicPreferences =
                showMusicPreferences;
    }

    public boolean isAllowPregameInvites() {
        return allowPregameInvites;
    }

    public void setAllowPregameInvites(
            boolean allowPregameInvites
    ) {
        this.allowPregameInvites =
                allowPregameInvites;
    }

    public boolean isAllowFriendRequests() {
        return allowFriendRequests;
    }

    public void setAllowFriendRequests(
            boolean allowFriendRequests
    ) {
        this.allowFriendRequests =
                allowFriendRequests;
    }
}
