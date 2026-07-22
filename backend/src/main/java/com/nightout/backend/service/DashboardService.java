package com.nightout.backend.service;

import com.nightout.backend.dto.EventSummaryDto;
import com.nightout.backend.dto.ManagerDashboardDto;
import com.nightout.backend.dto.SalesChannelDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.SalesChannel;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.mediator.DashboardDataMediator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final DashboardDataMediator dashboardDataMediator;

    private final NightOutMapper mapper;

    public DashboardService(
            DashboardDataMediator dashboardDataMediator,
            NightOutMapper mapper
    ) {
        this.dashboardDataMediator =
                dashboardDataMediator;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public ManagerDashboardDto getDashboard(
            Long managerId,
            Long eventId
    ) {
        AppUser manager =
                resolveManager(managerId);

        List<Event> managedEvents =
                dashboardDataMediator
                        .findEventsByCreator(
                                manager.getId()
                        );

        if (managedEvents.isEmpty()) {
            throw new NotFoundException(
                    "No managed events found for manager: "
                            + manager.getId()
            );
        }

        Event selectedEvent =
                eventId == null
                        ? managedEvents.getFirst()
                        : managedEvents
                                .stream()
                                .filter(
                                        event ->
                                                event.getId()
                                                        .equals(eventId)
                                )
                                .findFirst()
                                .orElseThrow(
                                        () ->
                                                new NotFoundException(
                                                        "Managed event not found: "
                                                                + eventId
                                                )
                                );

        List<SalesChannel> channels =
                dashboardDataMediator
                        .findSalesChannelsForEvent(
                                selectedEvent.getId()
                        );

        List<SalesChannelDto> channelDtos =
                channels
                        .stream()
                        .map(mapper::toSalesChannelDto)
                        .toList();

        double revenue =
                channels
                        .stream()
                        .mapToDouble(
                                SalesChannel::getRevenue
                        )
                        .sum();

        int totalTables =
                channels
                        .stream()
                        .mapToInt(
                                SalesChannel::getTableCount
                        )
                        .sum();

        int totalTickets =
                channels
                        .stream()
                        .mapToInt(
                                SalesChannel::getTicketCount
                        )
                        .sum();

        int pregames =
                dashboardDataMediator
                        .countPregamesForEvent(
                                selectedEvent.getId()
                        );

        long confirmed =
        dashboardDataMediator
                .countConfirmedTickets(
                        selectedEvent.getId()
                );

long checkins =
        dashboardDataMediator
                .countCheckedInConfirmedTickets(
                        selectedEvent.getId()
                );

int checkinRate =
        confirmed == 0
                ? 0
                : (int) Math.round(
                        checkins
                                * 100.0
                                / confirmed
                );

        List<String> insights =
                List.of(
                        "Best channel: "
                                + bestChannel(channels),
                        "Promo usage: 148 demo redemptions",
                        "Audience: 54% M / 46% F"
                );

        List<EventSummaryDto> eventDtos =
                managedEvents
                        .stream()
                        .map(mapper::toEventSummaryDto)
                        .toList();

        return new ManagerDashboardDto(
                manager.getId(),
                manager.getName(),
                selectedEvent.getId(),
                selectedEvent.getTitle(),
                selectedEvent.getVenue().getName(),
                totalTickets,
                totalTables,
                pregames,
                revenue,
                checkinRate,
                channelDtos,
                insights,
                eventDtos
        );
    }

    private AppUser resolveManager(
            Long managerId
    ) {
        if (managerId != null) {
            return dashboardDataMediator
                    .findUserById(managerId)
                    .orElseThrow(
                            () ->
                                    new NotFoundException(
                                            "Manager not found: "
                                                    + managerId
                                    )
                    );
        }

        return dashboardDataMediator
                .findUsersByRole(
                        UserRole.VENUE_MANAGER
                )
                .stream()
                .findFirst()
                .orElseThrow(
                        () ->
                                new NotFoundException(
                                        "No venue manager seed user found."
                                )
                );
    }

    private String bestChannel(
            List<SalesChannel> channels
    ) {
        return channels
                .stream()
                .max(
                        (left, right) ->
                                Double.compare(
                                        left.getRevenue(),
                                        right.getRevenue()
                                )
                )
                .map(SalesChannel::getName)
                .orElse("No channel data");
    }
}