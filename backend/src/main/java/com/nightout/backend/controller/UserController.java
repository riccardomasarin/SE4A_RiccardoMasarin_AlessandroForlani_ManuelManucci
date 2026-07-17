package com.nightout.backend.controller;

import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.PrivacySettingsDto;
import com.nightout.backend.dto.ProfileDto;
import com.nightout.backend.dto.SavedEventDto;
import com.nightout.backend.dto.UpdatePrivacySettingsRequest;
import com.nightout.backend.dto.UpdateProfileRequest;
import com.nightout.backend.dto.UserDto;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.service.UserService;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService
    ) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDto> getUsers(
            @RequestParam(required = false)
            UserRole role
    ) {
        return userService.findUsers(role);
    }

    @GetMapping("/{userId}")
    public UserDto getUser(
            @PathVariable Long userId
    ) {
        return userService.getUser(userId);
    }

    @GetMapping("/{userId}/profile")
    public ProfileDto getProfile(
            @PathVariable Long userId
    ) {
        return userService.getProfile(userId);
    }

    @PutMapping("/{userId}/profile")
    public UserDto updateProfile(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(
                userId,
                request
        );
    }

    @GetMapping("/{userId}/privacy-settings")
    public PrivacySettingsDto getPrivacySettings(
            @PathVariable Long userId
    ) {
        return userService.getPrivacySettings(
                userId
        );
    }

    @PutMapping("/{userId}/privacy-settings")
    public PrivacySettingsDto updatePrivacySettings(
            @PathVariable Long userId,
            @RequestBody
            UpdatePrivacySettingsRequest request
    ) {
        return userService.updatePrivacySettings(
                userId,
                request
        );
    }

    @PostMapping(
            value = "/{userId}/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public UserDto updateAvatar(
            @PathVariable Long userId,
            @RequestPart("file")
            MultipartFile file
    ) {
        return userService.updateAvatar(
                userId,
                file
        );
    }

    @DeleteMapping("/{userId}/avatar")
    public UserDto removeAvatar(
            @PathVariable Long userId
    ) {
        return userService.removeAvatar(userId);
    }

    @GetMapping("/{userId}/saved-events")
    public List<EventSummaryDto> getSavedEvents(
            @PathVariable Long userId
    ) {
        return userService.findSavedEvents(userId);
    }

    @GetMapping(
            "/{userId}/saved-events/{eventId}"
    )
    public SavedEventDto getSavedEvent(
            @PathVariable Long userId,
            @PathVariable Long eventId
    ) {
        return userService.getSavedEvent(
                userId,
                eventId
        );
    }

    @PostMapping(
            "/{userId}/saved-events/{eventId}"
    )
    public SavedEventDto saveEvent(
            @PathVariable Long userId,
            @PathVariable Long eventId
    ) {
        return userService.saveEvent(
                userId,
                eventId
        );
    }

    @DeleteMapping(
            "/{userId}/saved-events/{eventId}"
    )
    public SavedEventDto unsaveEvent(
            @PathVariable Long userId,
            @PathVariable Long eventId
    ) {
        return userService.unsaveEvent(
                userId,
                eventId
        );
    }
}