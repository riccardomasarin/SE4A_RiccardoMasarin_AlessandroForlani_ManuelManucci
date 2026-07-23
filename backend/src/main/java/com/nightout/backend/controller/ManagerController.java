package com.nightout.backend.controller;

import com.nightout.backend.dto.CreateEventDto;
import com.nightout.backend.dto.EventDetailDto;
import com.nightout.backend.dto.ManagerDashboardDto;
import com.nightout.backend.dto.UpdateEventDto;
import com.nightout.backend.dto.UpdateVenueRequest;
import com.nightout.backend.dto.VenueDto;
import com.nightout.backend.service.DashboardService;
import com.nightout.backend.service.VenueManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final DashboardService dashboardService;
    private final VenueManagementService venueManagementService;

    public ManagerController(
            DashboardService dashboardService,
            VenueManagementService venueManagementService
    ) {
        this.dashboardService = dashboardService;
        this.venueManagementService = venueManagementService;
    }

    @GetMapping("/dashboard")
    public ManagerDashboardDto getDashboard(
            @RequestParam(required = false) Long managerId,
            @RequestParam(required = false) Long eventId
    ) {
        return dashboardService.getDashboard(
                managerId,
                eventId
        );
    }

    @GetMapping("/venues")
    public List<VenueDto> getManagerVenues(
            @RequestParam Long managerId
    ) {
        return venueManagementService
                .getVenuesForManager(managerId);
    }

    @PutMapping("/venues/{venueId}")
    public VenueDto updateVenue(
            @PathVariable Long venueId,
            @Valid @RequestBody UpdateVenueRequest request
    ) {
        return venueManagementService.updateVenue(
                venueId,
                request
        );
    }

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    public EventDetailDto createEvent(
            @Valid @RequestBody CreateEventDto request
    ) {
        return venueManagementService.createEvent(
                request
        );
    }

    @GetMapping("/events")
    public List<EventDetailDto> getManagerEvents(
            @RequestParam Long managerId
    ) {
        return venueManagementService
                .getEventsForManager(managerId);
    }

    @PutMapping("/events/{eventId}")
    public EventDetailDto updateEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody UpdateEventDto request
    ) {
        return venueManagementService.updateEvent(
                eventId,
                request
        );
    }

    @DeleteMapping("/events/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long eventId,
            @RequestParam Long managerId
    ) {
        venueManagementService.deleteEvent(
                eventId,
                managerId
        );
    }
}