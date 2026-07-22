package com.nightout.backend.dto;

public record UpdatePrivacySettingsRequest(
        boolean privateProfile,
        boolean showCity,
        boolean showMusicPreferences,
        boolean allowPregameInvites,
        boolean allowFriendRequests
) {
}