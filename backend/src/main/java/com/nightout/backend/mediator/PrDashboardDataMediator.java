package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.PrEventAssignment;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.PrEventAssignmentRepository;
import com.nightout.backend.repository.TicketRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class PrDashboardDataMediator {

    private final AppUserRepository userRepository;
    private final PrEventAssignmentRepository prAssignmentRepository;
    private final TicketRepository ticketRepository;

    public PrDashboardDataMediator(
            AppUserRepository userRepository,
            PrEventAssignmentRepository prAssignmentRepository,
            TicketRepository ticketRepository
    ) {
        this.userRepository = userRepository;
        this.prAssignmentRepository = prAssignmentRepository;
        this.ticketRepository = ticketRepository;
    }

    public Optional<AppUser> findUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public List<PrEventAssignment> findAssignmentsForPr(Long prId) {
        return prAssignmentRepository.findByPrIdOrderByCreatedAtDesc(prId);
    }

    public List<Ticket> findTicketsForPr(Long prId) {
        return ticketRepository.findByPrAssignmentPrIdOrderByCreatedAtDesc(prId);
    }
}