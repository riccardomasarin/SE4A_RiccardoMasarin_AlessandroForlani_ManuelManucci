package com.nightout.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
public class PregameRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne
    private AppUser host;

    @ManyToOne
    private Event event;

    private String meetingLocation;
    private LocalDateTime meetingTime;
    private int maxParticipants;
    private String description;
    private String imageUrl;
    private boolean officialPartner;

    @ManyToMany
    @JoinTable(
            name = "pregame_participants",
            joinColumns = @JoinColumn(name = "pregame_room_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<AppUser> participants = new LinkedHashSet<>();

    public PregameRoom() {
    }

    public PregameRoom(String title, AppUser host, Event event, String meetingLocation, LocalDateTime meetingTime,
            int maxParticipants, String description, String imageUrl, boolean officialPartner) {
        this.title = title;
        this.host = host;
        this.event = event;
        this.meetingLocation = meetingLocation;
        this.meetingTime = meetingTime;
        this.maxParticipants = maxParticipants;
        this.description = description;
        this.imageUrl = imageUrl;
        this.officialPartner = officialPartner;
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

    public AppUser getHost() {
        return host;
    }

    public void setHost(AppUser host) {
        this.host = host;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getMeetingLocation() {
        return meetingLocation;
    }

    public void setMeetingLocation(String meetingLocation) {
        this.meetingLocation = meetingLocation;
    }

    public LocalDateTime getMeetingTime() {
        return meetingTime;
    }

    public void setMeetingTime(LocalDateTime meetingTime) {
        this.meetingTime = meetingTime;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isOfficialPartner() {
        return officialPartner;
    }

    public void setOfficialPartner(boolean officialPartner) {
        this.officialPartner = officialPartner;
    }

    public Set<AppUser> getParticipants() {
        return participants;
    }

    public void setParticipants(Set<AppUser> participants) {
        this.participants = participants;
    }
}
