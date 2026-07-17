package com.nightout.backend.repository;

import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository
        extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<Ticket> findByEventId(
            Long eventId
    );

    List<Ticket>
            findByEventIdAndStatusOrderByCreatedAtAsc(
                    Long eventId,
                    TicketStatus status
            );

    List<Ticket>
            findByEventCreatedByIdOrderByCreatedAtDesc(
                    Long managerId
            );

    List<Ticket>
            findByPrAssignmentPrIdOrderByCreatedAtDesc(
                    Long prId
            );

    List<Ticket>
            findByPrAssignmentPrIdAndStatusOrderByCreatedAtDesc(
                    Long prId,
                    TicketStatus status
            );

    long countByEventIdAndStatus(
            Long eventId,
            TicketStatus status
    );

    long countByPrAssignmentPrIdAndStatus(
            Long prId,
            TicketStatus status
    );

    long countByPrAssignmentPrIdAndCheckedInAtIsNotNull(
            Long prId
    );

    boolean existsByUserIdAndEventIdAndStatusIn(
            Long userId,
            Long eventId,
            Collection<TicketStatus> statuses
    );
}