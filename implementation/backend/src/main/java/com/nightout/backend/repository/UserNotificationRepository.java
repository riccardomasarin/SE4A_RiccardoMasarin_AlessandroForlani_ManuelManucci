package com.nightout.backend.repository;

import com.nightout.backend.entity.UserNotification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
