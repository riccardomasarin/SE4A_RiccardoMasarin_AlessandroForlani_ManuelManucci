package com.nightout.backend.controller;

import com.nightout.backend.dto.CreateSupportRequestRequest;
import com.nightout.backend.dto.SupportRequestDto;
import com.nightout.backend.service.SupportRequestService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
        "/api/users/{userId}/support-requests"
)
public class SupportRequestController {

    private final SupportRequestService supportRequestService;

    public SupportRequestController(
            SupportRequestService supportRequestService
    ) {
        this.supportRequestService =
                supportRequestService;
    }

    @PostMapping
    public SupportRequestDto createSupportRequest(
            @PathVariable Long userId,
            @RequestBody CreateSupportRequestRequest request
    ) {
        return supportRequestService
                .createSupportRequest(
                        userId,
                        request
                );
    }
}