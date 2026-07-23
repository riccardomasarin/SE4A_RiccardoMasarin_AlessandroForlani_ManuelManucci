package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.SupportRequest;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.SupportRequestRepository;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class SupportRequestDataMediator {

    private final SupportRequestRepository supportRequestRepository;
    private final AppUserRepository userRepository;

    public SupportRequestDataMediator(
            SupportRequestRepository supportRequestRepository,
            AppUserRepository userRepository
    ) {
        this.supportRequestRepository = supportRequestRepository;
        this.userRepository = userRepository;
    }

    public Optional<AppUser> findUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public SupportRequest saveSupportRequest(
            SupportRequest supportRequest
    ) {
        return supportRequestRepository.save(supportRequest);
    }
}