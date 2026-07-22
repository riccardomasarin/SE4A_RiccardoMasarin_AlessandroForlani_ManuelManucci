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
public class SupportRequest {

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
            length = 50
    )
    private String category;

    @Column(
            nullable = false,
            length = 120
    )
    private String subject;

    @Column(
            nullable = false,
            length = 2000
    )
    private String message;

    @Column(
            nullable = false,
            length = 30
    )
    private String status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public SupportRequest() {
    }

    public SupportRequest(
            AppUser user,
            String category,
            String subject,
            String message
    ) {
        this.user = user;
        this.category = category;
        this.subject = subject;
        this.message = message;
        this.status = "OPEN";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public String getCategory() {
        return category;
    }

    public String getSubject() {
        return subject;
    }

    public String getMessage() {
        return message;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}