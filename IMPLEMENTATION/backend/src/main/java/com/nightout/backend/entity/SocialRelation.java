package com.nightout.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class SocialRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private AppUser sourceUser;

    @ManyToOne
    private AppUser targetUser;

    private String relationType;

    public SocialRelation() {
    }

    public SocialRelation(AppUser sourceUser, AppUser targetUser, String relationType) {
        this.sourceUser = sourceUser;
        this.targetUser = targetUser;
        this.relationType = relationType;
    }

    public Long getId() {
        return id;
    }

    public AppUser getSourceUser() {
        return sourceUser;
    }

    public void setSourceUser(AppUser sourceUser) {
        this.sourceUser = sourceUser;
    }

    public AppUser getTargetUser() {
        return targetUser;
    }

    public void setTargetUser(AppUser targetUser) {
        this.targetUser = targetUser;
    }

    public String getRelationType() {
        return relationType;
    }

    public void setRelationType(String relationType) {
        this.relationType = relationType;
    }
}
