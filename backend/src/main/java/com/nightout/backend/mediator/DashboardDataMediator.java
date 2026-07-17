package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.SalesChannel;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.PregameRoomRepository;
import com.nightout.backend.repository.SalesChannelRepository;
import com.nightout.backend.repository.TicketRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class DashboardDataMediator {

    private final AppUserRepository userRepository;

    private final EventRepository eventRepository;

    private final TicketRepository ticketRepository;

    private final PregameRoomRepository
            pregameRoomRepository;

    private final SalesChannelRepository
            salesChannelRepository;

    public DashboardDataMediator(
            AppUserRepository userRepository,
            EventRepository eventRepository,
            TicketRepository ticketRepository,
            PregameRoomRepository pregameRoomRepository,
            SalesChannelRepository salesChannelRepository
    ) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.pregameRoomRepository =
                pregameRoomRepository;
        this.salesChannelRepository =
                salesChannelRepository;
    }

    public Optional<AppUser> findUserById(
            Long userId
    ) {
        return userRepository.findById(userId);
    }

    public List<AppUser> findUsersByRole(
            UserRole role
    ) {
        return userRepository.findByRole(role);
    }

    public List<Event> findEventsByCreator(
            Long managerId
    ) {
        return eventRepository
                .findByCreatedById(managerId);
    }

    public List<SalesChannel> findSalesChannelsForEvent(
            Long eventId
    ) {
        return salesChannelRepository
                .findByEventId(eventId);
    }

    public long countConfirmedTickets(
            Long eventId
    ) {
        return ticketRepository
                .countByEventIdAndStatus(
                        eventId,
                        TicketStatus.CONFIRMED
                );
    }

    public int countPregamesForEvent(
            Long eventId
    ) {
        return pregameRoomRepository
                .findByEventId(eventId)
                .size();
    }
}