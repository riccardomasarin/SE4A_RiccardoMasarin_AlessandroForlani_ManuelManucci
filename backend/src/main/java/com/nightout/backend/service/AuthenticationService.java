package com.nightout.backend.service;

import com.nightout.backend.dto.LoginRequestDto;
import com.nightout.backend.dto.LoginResponseDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.repository.AppUserRepository;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthenticationService {

    private static final String INVALID_CREDENTIALS =
            "Invalid email or password";

    private final AppUserRepository userRepository;

    public AuthenticationService(
            AppUserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public LoginResponseDto login(
            LoginRequestDto request
    ) {
        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        AppUser user = userRepository
                .findByEmailIgnoreCase(email)
                .filter(profile ->
                        profile.getPassword() != null
                                && profile.getPassword()
                                .equals(request.password()))
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                INVALID_CREDENTIALS
                        ));

        return new LoginResponseDto(
                true,
                user.getId(),
                user.getName(),
                user.getEmail(),
                toAuthenticationRole(user.getRole())
        );
    }

    private String toAuthenticationRole(
            UserRole role
    ) {
        return switch (role) {
            case NORMAL_USER -> "USER";
            case VENUE_MANAGER -> "VENUE";
            case PR_MANAGER -> "PR";
        };
    }
}
