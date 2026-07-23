package com.nightout.backend.service;

import com.nightout.backend.dto.FriendshipDto;
import com.nightout.backend.dto.FriendUserDto;
import com.nightout.backend.dto.SendFriendRequestDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Friendship;
import com.nightout.backend.entity.FriendshipStatus;
import com.nightout.backend.entity.NotificationType;
import com.nightout.backend.friendshipevent.FriendshipNotificationEvent;
import com.nightout.backend.mediator.FriendshipDataMediator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FriendshipService {

    private final FriendshipDataMediator friendshipDataMediator;
    private final ApplicationEventPublisher eventPublisher;

    public FriendshipService(
            FriendshipDataMediator friendshipDataMediator,
            ApplicationEventPublisher eventPublisher
    ) {
        this.friendshipDataMediator = friendshipDataMediator;
        this.eventPublisher = eventPublisher;
    }

    public List<FriendUserDto> searchUsers(
            Long currentUserId,
            String query
    ) {
        requireUser(currentUserId);

        if (query == null || query.isBlank()) {
            return List.of();
        }

        String normalizedQuery = query
                .trim()
                .toLowerCase(Locale.ROOT);

        return friendshipDataMediator.findAllUsers()
                .stream()
                .filter(user -> !Objects.equals(
                        user.getId(),
                        currentUserId
                ))
                .filter(AppUser::isAllowFriendRequests)
                .filter(user -> user.getName() != null)
                .filter(user -> user
                        .getName()
                        .toLowerCase(Locale.ROOT)
                        .contains(normalizedQuery)
                )
                .filter(user -> canAppearInSearch(
                        currentUserId,
                        user.getId()
                ))
                .limit(20)
                .map(this::toFriendUserDto)
                .toList();
    }

    public FriendshipDto sendRequest(
            SendFriendRequestDto request
    ) {
        if (request == null) {
            throw new BadRequestException(
                    "Friend request data is required."
            );
        }

        AppUser sender = requireUser(request.senderId());
        AppUser receiver = requireUser(request.receiverId());

        if (Objects.equals(
                sender.getId(),
                receiver.getId()
        )) {
            throw new BadRequestException(
                    "You cannot send a friend request to yourself."
            );
        }

        if (!receiver.isAllowFriendRequests()) {
            throw new BadRequestException(
                    "This user does not accept friend requests."
            );
        }

        Optional<Friendship> existingRelationship =
                findRelationship(
                        sender.getId(),
                        receiver.getId()
                );

        if (existingRelationship.isPresent()) {
            Friendship existing = existingRelationship.get();

            if (existing.getStatus()
                    == FriendshipStatus.ACCEPTED) {
                throw new BadRequestException(
                        "You are already friends."
                );
            }

            if (existing.getStatus()
                    == FriendshipStatus.PENDING) {
                if (Objects.equals(
                        existing.getSender().getId(),
                        sender.getId()
                )) {
                    throw new BadRequestException(
                            "Friend request already sent."
                    );
                }

                throw new BadRequestException(
                        "This user has already sent you a friend request."
                );
            }

            friendshipDataMediator.deleteFriendship(existing);
        }

        Friendship friendship = new Friendship(
                sender,
                receiver,
                FriendshipStatus.PENDING
        );

        Friendship savedFriendship =
                friendshipDataMediator.saveFriendship(friendship);

        eventPublisher.publishEvent(
                new FriendshipNotificationEvent(
                        receiver,
                        NotificationType.FRIEND_REQUEST,
                        sender.getName()
                                + " sent you a friend request."
                )
        );

        return toFriendshipDto(savedFriendship);
    }

    @Transactional(readOnly = true)
    public List<FriendshipDto> getReceivedRequests(
            Long userId
    ) {
        requireUser(userId);

        return friendshipDataMediator
                .findReceivedRequests(userId)
                .stream()
                .map(this::toFriendshipDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendshipDto> getSentRequests(
            Long userId
    ) {
        requireUser(userId);

        return friendshipDataMediator
                .findSentRequests(userId)
                .stream()
                .map(this::toFriendshipDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendUserDto> getFriends(
            Long userId
    ) {
        requireUser(userId);

        return friendshipDataMediator
                .findUserFriendships(userId)
                .stream()
                .filter(friendship ->
                        friendship.getStatus()
                                == FriendshipStatus.ACCEPTED
                )
                .map(friendship -> getOtherUser(
                        friendship,
                        userId
                ))
                .map(this::toFriendUserDto)
                .distinct()
                .toList();
    }

    public FriendshipDto acceptRequest(
            Long friendshipId,
            Long receiverId
    ) {
        Friendship friendship =
                requireFriendship(friendshipId);

        verifyReceiver(friendship, receiverId);

        if (friendship.getStatus()
                != FriendshipStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending friend requests can be accepted."
            );
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);

        Friendship savedFriendship =
                friendshipDataMediator.saveFriendship(friendship);

        eventPublisher.publishEvent(
                new FriendshipNotificationEvent(
                        friendship.getSender(),
                        NotificationType.FRIEND_REQUEST_ACCEPTED,
                        friendship.getReceiver().getName()
                                + " accepted your friend request."
                )
        );

        return toFriendshipDto(savedFriendship);
    }

    public FriendshipDto rejectRequest(
            Long friendshipId,
            Long receiverId
    ) {
        Friendship friendship =
                requireFriendship(friendshipId);

        verifyReceiver(friendship, receiverId);

        if (friendship.getStatus()
                != FriendshipStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending friend requests can be rejected."
            );
        }

        friendship.setStatus(FriendshipStatus.REJECTED);

        return toFriendshipDto(
                friendshipDataMediator.saveFriendship(friendship)
        );
    }

    public void removeFriend(
        Long currentUserId,
        Long friendUserId
) {
    requireUser(currentUserId);
    requireUser(friendUserId);

    Friendship friendship = findRelationship(
            currentUserId,
            friendUserId
    ).orElseThrow(() ->
            new NotFoundException(
                    "Friendship not found."
            )
    );

    if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
        throw new BadRequestException(
                "This relationship is not an active friendship."
        );
    }

    friendshipDataMediator.deleteFriendship(friendship);
}

    @Transactional(readOnly = true)
    public List<FriendUserDto> getFriendsAttending(
            Long userId,
            Long eventId
    ) {
        if (eventId == null) {
            throw new BadRequestException(
                    "Event id is required."
            );
        }

        return getFriends(userId)
                .stream()
                .filter(friend ->
                        friendshipDataMediator.hasConfirmedTicket(
                                friend.id(),
                                eventId
                        )
                )
                .toList();
    }

    private boolean canAppearInSearch(
            Long currentUserId,
            Long candidateId
    ) {
        Optional<Friendship> relationship =
                findRelationship(
                        currentUserId,
                        candidateId
                );

        return relationship.isEmpty()
                || relationship.get().getStatus()
                == FriendshipStatus.REJECTED;
    }

    private Optional<Friendship> findRelationship(
            Long firstUserId,
            Long secondUserId
    ) {
        Optional<Friendship> directRelationship =
                friendshipDataMediator.findFriendship(
                        firstUserId,
                        secondUserId
                );

        if (directRelationship.isPresent()) {
            return directRelationship;
        }

        return friendshipDataMediator.findFriendship(
                secondUserId,
                firstUserId
        );
    }

    private AppUser requireUser(Long userId) {
        if (userId == null) {
            throw new BadRequestException(
                    "User id is required."
            );
        }

        return friendshipDataMediator
                .findUserById(userId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "User not found."
                        )
                );
    }

    private Friendship requireFriendship(
            Long friendshipId
    ) {
        if (friendshipId == null) {
            throw new BadRequestException(
                    "Friendship id is required."
            );
        }

        return friendshipDataMediator
                .findFriendshipById(friendshipId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Friend request not found."
                        )
                );
    }

    private void verifyReceiver(
            Friendship friendship,
            Long receiverId
    ) {
        if (!Objects.equals(
                friendship.getReceiver().getId(),
                receiverId
        )) {
            throw new BadRequestException(
                    "Only the receiver can manage this request."
            );
        }
    }

    private AppUser getOtherUser(
            Friendship friendship,
            Long userId
    ) {
        if (Objects.equals(
                friendship.getSender().getId(),
                userId
        )) {
            return friendship.getReceiver();
        }

        return friendship.getSender();
    }

    private FriendUserDto toFriendUserDto(
            AppUser user
    ) {
        String visibleCity = user.isShowCity()
                ? user.getCity()
                : null;

        return new FriendUserDto(
                user.getId(),
                user.getName(),
                visibleCity,
                user.isVerified(),
                user.getAvatarUrl()
        );
    }

    private FriendshipDto toFriendshipDto(
            Friendship friendship
    ) {
        return new FriendshipDto(
                friendship.getId(),
                toFriendUserDto(friendship.getSender()),
                toFriendUserDto(friendship.getReceiver()),
                friendship.getStatus(),
                friendship.getCreatedAt(),
                friendship.getUpdatedAt()
        );
    }
}