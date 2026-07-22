package com.nightout.backend.service;

import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.NotificationDto;
import com.nightout.backend.dto.PrivacySettingsDto;
import com.nightout.backend.dto.ProfileDto;
import com.nightout.backend.dto.SavedEventDto;
import com.nightout.backend.dto.TicketDto;
import com.nightout.backend.dto.UpdatePrivacySettingsRequest;
import com.nightout.backend.dto.UpdateProfileRequest;
import com.nightout.backend.dto.UserDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.EventParticipation;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.mediator.UserDataMediator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private static final String SAVED_STATUS = "SAVED";

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile(
                    "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
            );

    private final UserDataMediator userDataMediator;

    private final NotificationService notificationService;

    private final AvatarStorageService avatarStorageService;

    private final NightOutMapper mapper;

    public UserService(
            UserDataMediator userDataMediator,
            NotificationService notificationService,
            AvatarStorageService avatarStorageService,
            NightOutMapper mapper
    ) {
        this.userDataMediator = userDataMediator;
        this.notificationService = notificationService;
        this.avatarStorageService = avatarStorageService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<UserDto> findUsers(
            UserRole role
    ) {
        List<AppUser> users =
                role == null
                        ? userDataMediator.findAllUsers()
                        : userDataMediator
                                .findUsersByRole(role);

        return users
                .stream()
                .map(mapper::toUserDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDto getUser(
            Long userId
    ) {
        AppUser user = findUser(userId);

        return mapper.toUserDto(user);
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfile(
            Long userId
    ) {
        AppUser user = findUser(userId);

        List<EventSummaryDto> savedEvents =
                findSavedEvents(userId);

        List<TicketDto> tickets =
                userDataMediator
                        .findTicketsForUser(userId)
                        .stream()
                        .map(mapper::toTicketDto)
                        .toList();

        List<NotificationDto> notifications =
                notificationService
                        .getNotifications(userId);

        long hostedPregames =
                userDataMediator
                        .countHostedPregames(userId);

        long attendedNights =
                tickets
                        .stream()
                        .filter(
                                ticket ->
                                        ticket.status()
                                                .name()
                                                .equals(
                                                        "CONFIRMED"
                                                )
                        )
                        .count();

        return new ProfileDto(
                mapper.toUserDto(user),
                attendedNights,
                tickets.size(),
                hostedPregames,
                savedEvents,
                tickets,
                notifications
        );
    }

    @Transactional
    public UserDto updateProfile(
            Long userId,
            UpdateProfileRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Profile information is required"
            );
        }

        AppUser user = findUser(userId);

        String name =
                normalizeRequiredValue(
                        request.name(),
                        "Name is required"
                );

        String email =
                normalizeRequiredValue(
                        request.email(),
                        "Email is required"
                )
                        .toLowerCase(
                                Locale.ROOT
                        );

        String city =
                normalizeRequiredValue(
                        request.city(),
                        "City is required"
                );

        if (
                !EMAIL_PATTERN
                        .matcher(email)
                        .matches()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid email address"
            );
        }

        boolean emailAlreadyUsed =
                userDataMediator
                        .emailUsedByAnotherUser(
                                email,
                                userId
                        );

        if (emailAlreadyUsed) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This email address is already in use"
            );
        }

        boolean emailChanged =
                user.getEmail() == null
                        || !user
                                .getEmail()
                                .equalsIgnoreCase(email);

        Set<String> preferences =
                new LinkedHashSet<>();

        if (
                request.musicPreferences()
                        != null
        ) {
            for (
                    String preference :
                    request.musicPreferences()
            ) {
                if (
                        preference != null
                                && !preference
                                        .isBlank()
                ) {
                    preferences.add(
                            preference.trim()
                    );
                }
            }
        }

        user.setName(name);
        user.setEmail(email);
        user.setCity(city);
        user.setMusicPreferences(preferences);

        if (emailChanged) {
            user.setVerified(false);
        }

        AppUser updatedUser =
                userDataMediator.saveUser(user);

        return mapper.toUserDto(updatedUser);
    }

    @Transactional(readOnly = true)
    public PrivacySettingsDto getPrivacySettings(
            Long userId
    ) {
        AppUser user = findUser(userId);

        return toPrivacySettingsDto(user);
    }

    @Transactional
    public PrivacySettingsDto updatePrivacySettings(
            Long userId,
            UpdatePrivacySettingsRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Privacy settings are required"
            );
        }

        AppUser user = findUser(userId);

        user.setPrivateProfile(
                request.privateProfile()
        );

        user.setShowCity(
                request.showCity()
        );

        user.setShowMusicPreferences(
                request.showMusicPreferences()
        );

        user.setAllowPregameInvites(
                request.allowPregameInvites()
        );

        user.setAllowFriendRequests(
                request.allowFriendRequests()
        );

        AppUser updatedUser =
                userDataMediator.saveUser(user);

        return toPrivacySettingsDto(updatedUser);
    }

    @Transactional
    public UserDto updateAvatar(
            Long userId,
            MultipartFile file
    ) {
        AppUser user = findUser(userId);

        String previousAvatarUrl =
                user.getAvatarUrl();

        String newAvatarUrl =
                avatarStorageService
                        .saveAvatar(file);

        user.setAvatarUrl(newAvatarUrl);

        AppUser updatedUser;

        try {
            updatedUser =
                    userDataMediator
                            .saveUser(user);
        } catch (RuntimeException exception) {
            avatarStorageService
                    .deleteAvatar(newAvatarUrl);

            throw exception;
        }

        if (
                previousAvatarUrl != null
                        && !previousAvatarUrl
                                .equals(newAvatarUrl)
        ) {
            avatarStorageService
                    .deleteAvatar(
                            previousAvatarUrl
                    );
        }

        return mapper.toUserDto(updatedUser);
    }

    @Transactional
    public UserDto removeAvatar(
            Long userId
    ) {
        AppUser user = findUser(userId);

        String previousAvatarUrl =
                user.getAvatarUrl();

        user.setAvatarUrl(null);

        AppUser updatedUser =
                userDataMediator.saveUser(user);

        if (
                previousAvatarUrl != null
                        && previousAvatarUrl
                                .startsWith(
                                        "/uploads/avatars/"
                                )
        ) {
            avatarStorageService
                    .deleteAvatar(
                            previousAvatarUrl
                    );
        }

        return mapper.toUserDto(updatedUser);
    }

    @Transactional(readOnly = true)
    public List<EventSummaryDto> findSavedEvents(
            Long userId
    ) {
        ensureUserExists(userId);

        return userDataMediator
                .findSavedParticipations(
                        userId,
                        SAVED_STATUS
                )
                .stream()
                .map(
                        EventParticipation::getEvent
                )
                .map(mapper::toEventSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SavedEventDto getSavedEvent(
            Long userId,
            Long eventId
    ) {
        ensureUserExists(userId);

        Event event = findEvent(eventId);

        boolean saved =
                userDataMediator
                        .findParticipation(
                                userId,
                                eventId
                        )
                        .map(
                                participation ->
                                        SAVED_STATUS
                                                .equalsIgnoreCase(
                                                        participation
                                                                .getStatus()
                                                )
                        )
                        .orElse(false);

        return new SavedEventDto(
                userId,
                eventId,
                saved,
                mapper.toEventSummaryDto(event)
        );
    }

    @Transactional
    public SavedEventDto saveEvent(
            Long userId,
            Long eventId
    ) {
        AppUser user = findUser(userId);

        Event event = findEvent(eventId);

        EventParticipation participation =
                userDataMediator
                        .findParticipation(
                                userId,
                                eventId
                        )
                        .orElseGet(
                                () ->
                                        new EventParticipation(
                                                user,
                                                event,
                                                SAVED_STATUS
                                        )
                        );

        participation.setUser(user);
        participation.setEvent(event);
        participation.setStatus(SAVED_STATUS);

        userDataMediator
                .saveParticipation(
                        participation
                );

        return new SavedEventDto(
                userId,
                eventId,
                true,
                mapper.toEventSummaryDto(event)
        );
    }

    @Transactional
    public SavedEventDto unsaveEvent(
            Long userId,
            Long eventId
    ) {
        ensureUserExists(userId);

        Event event = findEvent(eventId);

        userDataMediator
                .findParticipation(
                        userId,
                        eventId
                )
                .filter(
                        participation ->
                                SAVED_STATUS
                                        .equalsIgnoreCase(
                                                participation
                                                        .getStatus()
                                        )
                )
                .ifPresent(
                        userDataMediator::
                                deleteParticipation
                );

        return new SavedEventDto(
                userId,
                eventId,
                false,
                mapper.toEventSummaryDto(event)
        );
    }

    private String normalizeRequiredValue(
            String value,
            String errorMessage
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    errorMessage
            );
        }

        return value.trim();
    }

    private PrivacySettingsDto
            toPrivacySettingsDto(
                    AppUser user
            ) {
        return new PrivacySettingsDto(
                user.isPrivateProfile(),
                user.isShowCity(),
                user.isShowMusicPreferences(),
                user.isAllowPregameInvites(),
                user.isAllowFriendRequests()
        );
    }

    private AppUser findUser(
            Long userId
    ) {
        return userDataMediator
                .findUserById(userId)
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "User not found: "
                                                + userId
                                )
                );
    }

    private void ensureUserExists(
            Long userId
    ) {
        if (
                !userDataMediator
                        .userExists(userId)
        ) {
            throw new NotFoundException(
                    "User not found: "
                            + userId
            );
        }
    }

    private Event findEvent(
            Long eventId
    ) {
        return userDataMediator
                .findEventById(eventId)
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "Event not found: "
                                                + eventId
                                )
                );
    }
}