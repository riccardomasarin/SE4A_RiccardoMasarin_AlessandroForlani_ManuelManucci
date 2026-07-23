package com.nightout.backend.repository;

import com.nightout.backend.entity.Friendship;
import com.nightout.backend.entity.FriendshipStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendshipRepository
        extends JpaRepository<Friendship, Long> {

    Optional<Friendship> findBySenderIdAndReceiverId(
            Long senderId,
            Long receiverId
    );

    boolean existsBySenderIdAndReceiverId(
            Long senderId,
            Long receiverId
    );

    List<Friendship> findByReceiverIdAndStatusOrderByCreatedAtDesc(
            Long receiverId,
            FriendshipStatus status
    );

    List<Friendship> findBySenderIdAndStatusOrderByCreatedAtDesc(
            Long senderId,
            FriendshipStatus status
    );

    List<Friendship> findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
            Long senderId,
            Long receiverId
    );
}