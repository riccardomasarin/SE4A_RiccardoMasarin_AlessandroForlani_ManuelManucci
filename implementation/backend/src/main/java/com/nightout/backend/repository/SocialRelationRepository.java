package com.nightout.backend.repository;

import com.nightout.backend.entity.SocialRelation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SocialRelationRepository extends JpaRepository<SocialRelation, Long> {
    List<SocialRelation> findBySourceUserId(Long sourceUserId);
}
