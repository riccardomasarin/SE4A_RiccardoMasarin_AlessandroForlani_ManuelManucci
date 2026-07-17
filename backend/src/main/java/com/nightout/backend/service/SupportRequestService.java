package com.nightout.backend.service;

import com.nightout.backend.dto.CreateSupportRequestRequest;
import com.nightout.backend.dto.SupportRequestDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.SupportRequest;
import com.nightout.backend.mediator.SupportRequestDataMediator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SupportRequestService {

    private final SupportRequestDataMediator dataMediator;

    public SupportRequestService(
            SupportRequestDataMediator dataMediator
    ) {
        this.dataMediator = dataMediator;
    }

    @Transactional
    public SupportRequestDto createSupportRequest(
            Long userId,
            CreateSupportRequestRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Support request information is required"
            );
        }

        AppUser user = dataMediator.findUserById(userId)
                .orElseThrow(() -> new NotFoundException(
                        "User not found: " + userId
                ));

        String category = normalizeRequiredValue(
                request.category(),
                "Category is required"
        );

        String subject = normalizeRequiredValue(
                request.subject(),
                "Subject is required"
        );

        String message = normalizeRequiredValue(
                request.message(),
                "Message is required"
        );

        if (category.length() > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category must contain at most 50 characters"
            );
        }

        if (subject.length() > 120) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Subject must contain at most 120 characters"
            );
        }

        if (message.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Message must contain at most 2000 characters"
            );
        }

        SupportRequest supportRequest = new SupportRequest(
                user,
                category,
                subject,
                message
        );

        SupportRequest savedRequest =
                dataMediator.saveSupportRequest(supportRequest);

        return toDto(savedRequest);
    }

    private SupportRequestDto toDto(
            SupportRequest supportRequest
    ) {
        return new SupportRequestDto(
                supportRequest.getId(),
                supportRequest.getUser().getId(),
                supportRequest.getCategory(),
                supportRequest.getSubject(),
                supportRequest.getMessage(),
                supportRequest.getStatus(),
                supportRequest.getCreatedAt()
        );
    }

    private String normalizeRequiredValue(
            String value,
            String errorMessage
    ) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    errorMessage
            );
        }

        return value.trim();
    }
}