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

    private static final long DEFAULT_DURATION_HOURS = 6;

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String title;

    private String description;

    @ManyToOne
    private Venue venue;

    private LocalDateTime startsAt;

    /*
     * Orario effettivo di conclusione dell'evento.
     *
     * Viene utilizzato per la transizione:
     * CONFIRMED -> EXPIRED.
     */
    private LocalDateTime endsAt;

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

    /*
     * Costruttore già utilizzato nel progetto.
     *
     * Se non viene indicata una fine esplicita,
     * l'evento viene considerato concluso
     * sei ore dopo il suo inizio.
     */
    public Event(
            String title,
            String description,
            Venue venue,
            LocalDateTime startsAt,
            MusicGenre musicGenre,
            String dressCode,
            String ageRestriction,
            String entryCondition,
            double price,
            double vipPrice,
            int capacity,
            int popularityScore,
            boolean featured,
            String imageUrl,
            AppUser createdBy
    ) {
        this(
                title,
                description,
                venue,
                startsAt,
                defaultEndTime(startsAt),
                musicGenre,
                dressCode,
                ageRestriction,
                entryCondition,
                price,
                vipPrice,
                capacity,
                popularityScore,
                featured,
                imageUrl,
                createdBy
        );
    }

    /*
     * Costruttore completo che permette
     * di specificare l'orario di fine.
     */
    public Event(
            String title,
            String description,
            Venue venue,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            MusicGenre musicGenre,
            String dressCode,
            String ageRestriction,
            String entryCondition,
            double price,
            double vipPrice,
            int capacity,
            int popularityScore,
            boolean featured,
            String imageUrl,
            AppUser createdBy
    ) {
        validateEventTimes(
                startsAt,
                endsAt
        );

        this.title = title;
        this.description = description;
        this.venue = venue;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
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

    public void setTitle(
            String title
    ) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public Venue getVenue() {
        return venue;
    }

    public void setVenue(
            Venue venue
    ) {
        this.venue = venue;
    }

    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(
            LocalDateTime startsAt
    ) {
        if (startsAt == null) {
            throw new IllegalArgumentException(
                    "Event start time cannot be null."
            );
        }

        this.startsAt = startsAt;

        /*
         * Se la fine non esiste oppure non è più
         * successiva al nuovo inizio, viene
         * ricalcolata con la durata predefinita.
         */
        if (
                endsAt == null
                        || !endsAt.isAfter(startsAt)
        ) {
            this.endsAt =
                    defaultEndTime(startsAt);
        }
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(
            LocalDateTime endsAt
    ) {
        if (endsAt == null) {
            throw new IllegalArgumentException(
                    "Event end time cannot be null."
            );
        }

        if (
                startsAt != null
                        && !endsAt.isAfter(startsAt)
        ) {
            throw new IllegalArgumentException(
                    "Event end time must be after its start time."
            );
        }

        this.endsAt = endsAt;
    }

    /*
     * Restituisce true quando l'evento
     * è già iniziato.
     */
    public boolean hasStarted(
            LocalDateTime currentTime
    ) {
        if (currentTime == null) {
            throw new IllegalArgumentException(
                    "Current time cannot be null."
            );
        }

        return startsAt != null
                && !startsAt.isAfter(currentTime);
    }

    /*
     * Restituisce true quando l'evento
     * è già terminato.
     */
    public boolean hasEnded(
            LocalDateTime currentTime
    ) {
        if (currentTime == null) {
            throw new IllegalArgumentException(
                    "Current time cannot be null."
            );
        }

        return endsAt != null
                && !endsAt.isAfter(currentTime);
    }

    public MusicGenre getMusicGenre() {
        return musicGenre;
    }

    public void setMusicGenre(
            MusicGenre musicGenre
    ) {
        this.musicGenre = musicGenre;
    }

    public String getDressCode() {
        return dressCode;
    }

    public void setDressCode(
            String dressCode
    ) {
        this.dressCode = dressCode;
    }

    public String getAgeRestriction() {
        return ageRestriction;
    }

    public void setAgeRestriction(
            String ageRestriction
    ) {
        this.ageRestriction = ageRestriction;
    }

    public String getEntryCondition() {
        return entryCondition;
    }

    public void setEntryCondition(
            String entryCondition
    ) {
        this.entryCondition = entryCondition;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(
            double price
    ) {
        this.price = price;
    }

    public double getVipPrice() {
        return vipPrice;
    }

    public void setVipPrice(
            double vipPrice
    ) {
        this.vipPrice = vipPrice;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(
            int capacity
    ) {
        this.capacity = capacity;
    }

    public int getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(
            int popularityScore
    ) {
        this.popularityScore =
                popularityScore;
    }

    public int getAtmosphereScore() {
        return atmosphereScore;
    }

    public void setAtmosphereScore(
            int atmosphereScore
    ) {
        this.atmosphereScore =
                atmosphereScore;
    }

    public int getMusicScore() {
        return musicScore;
    }

    public void setMusicScore(
            int musicScore
    ) {
        this.musicScore = musicScore;
    }

    public int getDrinkScore() {
        return drinkScore;
    }

    public void setDrinkScore(
            int drinkScore
    ) {
        this.drinkScore = drinkScore;
    }

    public int getLineScore() {
        return lineScore;
    }

    public void setLineScore(
            int lineScore
    ) {
        this.lineScore = lineScore;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(
            boolean featured
    ) {
        this.featured = featured;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(
            String imageUrl
    ) {
        this.imageUrl = imageUrl;
    }

    public AppUser getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(
            AppUser createdBy
    ) {
        this.createdBy = createdBy;
    }

    private static LocalDateTime defaultEndTime(
            LocalDateTime startsAt
    ) {
        if (startsAt == null) {
            return null;
        }

        return startsAt.plusHours(
                DEFAULT_DURATION_HOURS
        );
    }

    private static void validateEventTimes(
            LocalDateTime startsAt,
            LocalDateTime endsAt
    ) {
        if (startsAt == null) {
            throw new IllegalArgumentException(
                    "Event start time cannot be null."
            );
        }

        if (endsAt == null) {
            throw new IllegalArgumentException(
                    "Event end time cannot be null."
            );
        }

        if (!endsAt.isAfter(startsAt)) {
            throw new IllegalArgumentException(
                    "Event end time must be after its start time."
            );
        }
    }
}