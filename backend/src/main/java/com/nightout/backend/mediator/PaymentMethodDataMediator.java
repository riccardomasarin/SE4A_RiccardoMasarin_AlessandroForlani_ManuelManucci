package com.nightout.backend.mediator;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.PaymentMethod;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.PaymentMethodRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class PaymentMethodDataMediator {

    private final PaymentMethodRepository paymentMethodRepository;
    private final AppUserRepository userRepository;

    public PaymentMethodDataMediator(
            PaymentMethodRepository paymentMethodRepository,
            AppUserRepository userRepository
    ) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.userRepository = userRepository;
    }

    public Optional<AppUser> findUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public boolean userExists(Long userId) {
        return userRepository.existsById(userId);
    }

    public List<PaymentMethod> findPaymentMethodsForUser(Long userId) {
        return paymentMethodRepository
                .findByUser_IdOrderByDefaultMethodDescCreatedAtDesc(userId);
    }

    public Optional<PaymentMethod> findPaymentMethod(
            Long paymentMethodId,
            Long userId
    ) {
        return paymentMethodRepository.findByIdAndUser_Id(
                paymentMethodId,
                userId
        );
    }

    public PaymentMethod savePaymentMethod(
            PaymentMethod paymentMethod
    ) {
        return paymentMethodRepository.save(paymentMethod);
    }

    public List<PaymentMethod> saveAllPaymentMethods(
            List<PaymentMethod> paymentMethods
    ) {
        return paymentMethodRepository.saveAll(paymentMethods);
    }

    public void deletePaymentMethod(
            PaymentMethod paymentMethod
    ) {
        paymentMethodRepository.delete(paymentMethod);
    }
}