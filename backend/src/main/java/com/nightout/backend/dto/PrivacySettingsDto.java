package com.nightout.backend.dto;

public record PrivacySettingsDto(
        boolean privateProfile,
        boolean showCity,
        boolean showMusicPreferences,
        boolean allowPregameInvites,
        boolean allowFriendRequests
) {
}