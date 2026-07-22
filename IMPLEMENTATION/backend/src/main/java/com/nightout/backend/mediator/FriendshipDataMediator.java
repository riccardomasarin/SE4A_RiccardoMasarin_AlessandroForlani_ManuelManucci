package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Friendship;
import com.nightout.backend.entity.FriendshipStatus;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.FriendshipRepository;
import com.nightout.backend.repository.TicketRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class FriendshipDataMediator {

    private final FriendshipRepository friendshipRepository;
    private final AppUserRepository userRepository;
    private final TicketRepository ticketRepository;

    public FriendshipDataMediator(
            FriendshipRepository friendshipRepository,
            AppUserRepository userRepository,
            TicketRepository ticketRepository
    ) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    public Optional<AppUser> findUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public List<AppUser> findAllUsers() {
        return userRepository.findAll();
    }

    public Optional<Friendship> findFriendshipById(
            Long friendshipId
    ) {
        return friendshipRepository.findById(friendshipId);
    }

    public Optional<Friendship> findFriendship(
            Long senderId,
            Long receiverId
    ) {
        return friendshipRepository
                .findBySenderIdAndReceiverId(
                        senderId,
                        receiverId
                );
    }

    public List<Friendship> findReceivedRequests(
            Long userId
    ) {
        return friendshipRepository
                .findByReceiverIdAndStatusOrderByCreatedAtDesc(
                        userId,
                        FriendshipStatus.PENDING
                );
    }

    public List<Friendship> findSentRequests(
            Long userId
    ) {
        return friendshipRepository
                .findBySenderIdAndStatusOrderByCreatedAtDesc(
                        userId,
                        FriendshipStatus.PENDING
                );
    }

    public List<Friendship> findUserFriendships(
            Long userId
    ) {
        return friendshipRepository
                .findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
                        userId,
                        userId
                );
    }

    public Friendship saveFriendship(
            Friendship friendship
    ) {
        return friendshipRepository.save(friendship);
    }

    public void deleteFriendship(
            Friendship friendship
    ) {
        friendshipRepository.delete(friendship);
    }

    public boolean hasConfirmedTicket(
            Long userId,
            Long eventId
    ) {
        return ticketRepository
                .existsByUserIdAndEventIdAndStatusIn(
                        userId,
                        eventId,
                        List.of(TicketStatus.CONFIRMED)
                );
    }
}