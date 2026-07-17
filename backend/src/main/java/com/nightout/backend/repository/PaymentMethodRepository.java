package com.nightout.backend.repository;

import com.nightout.backend.entity.PaymentMethod;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository
        extends JpaRepository<PaymentMethod, Long> {

    List<PaymentMethod>
            findByUser_IdOrderByDefaultMethodDescCreatedAtDesc(
                    Long userId
            );

    Optional<PaymentMethod> findByIdAndUser_Id(
            Long paymentMethodId,
            Long userId
    );
}