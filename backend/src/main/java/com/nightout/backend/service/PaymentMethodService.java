package com.nightout.backend.service;

import com.nightout.backend.dto.CreatePaymentMethodRequest;
import com.nightout.backend.dto.PaymentMethodDto;
import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.PaymentMethod;
import com.nightout.backend.mediator.PaymentMethodDataMediator;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentMethodService {

    private final PaymentMethodDataMediator dataMediator;

    public PaymentMethodService(
            PaymentMethodDataMediator dataMediator
    ) {
        this.dataMediator = dataMediator;
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodDto> getPaymentMethods(
            Long userId
    ) {
        ensureUserExists(userId);

        return dataMediator.findPaymentMethodsForUser(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PaymentMethodDto createPaymentMethod(
            Long userId,
            CreatePaymentMethodRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment method information is required"
            );
        }

        AppUser user = dataMediator.findUserById(userId)
                .orElseThrow(() -> new NotFoundException(
                        "User not found: " + userId
                ));

        String cardholderName = normalizeRequiredValue(
                request.cardholderName(),
                "Cardholder name is required"
        );

        String brand = normalizeRequiredValue(
                request.brand(),
                "Card brand is required"
        );

        String lastFourDigits = normalizeRequiredValue(
                request.lastFourDigits(),
                "Last four digits are required"
        );

        if (cardholderName.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cardholder name must contain at most 100 characters"
            );
        }

        if (brand.length() > 30) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Card brand must contain at most 30 characters"
            );
        }

        if (!lastFourDigits.matches("\\d{4}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter exactly four numeric digits"
            );
        }

        if (request.expiryMonth() < 1
                || request.expiryMonth() > 12) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Expiry month must be between 1 and 12"
            );
        }

        LocalDate today = LocalDate.now();

        boolean expired =
                request.expiryYear() < today.getYear()
                        || (request.expiryYear() == today.getYear()
                        && request.expiryMonth() < today.getMonthValue());

        if (expired) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The payment method is expired"
            );
        }

        List<PaymentMethod> existingMethods =
                dataMediator.findPaymentMethodsForUser(userId);

        boolean makeDefault =
                request.defaultMethod()
                        || existingMethods.isEmpty();

        if (makeDefault) {
            clearDefaultMethods(existingMethods);
        }

        PaymentMethod paymentMethod = new PaymentMethod(
                user,
                cardholderName,
                brand,
                lastFourDigits,
                request.expiryMonth(),
                request.expiryYear(),
                makeDefault
        );

        PaymentMethod savedMethod =
                dataMediator.savePaymentMethod(paymentMethod);

        return toDto(savedMethod);
    }

    @Transactional
    public PaymentMethodDto setDefaultPaymentMethod(
            Long userId,
            Long paymentMethodId
    ) {
        PaymentMethod selectedMethod =
                findPaymentMethod(userId, paymentMethodId);

        List<PaymentMethod> paymentMethods =
                dataMediator.findPaymentMethodsForUser(userId);

        for (PaymentMethod paymentMethod : paymentMethods) {
            paymentMethod.setDefaultMethod(
                    paymentMethod.getId()
                            .equals(paymentMethodId)
            );
        }

        dataMediator.saveAllPaymentMethods(paymentMethods);

        return toDto(selectedMethod);
    }

    @Transactional
    public void deletePaymentMethod(
            Long userId,
            Long paymentMethodId
    ) {
        PaymentMethod paymentMethod =
                findPaymentMethod(userId, paymentMethodId);

        boolean wasDefault =
                paymentMethod.isDefaultMethod();

        dataMediator.deletePaymentMethod(paymentMethod);

        if (wasDefault) {
            List<PaymentMethod> remainingMethods =
                    dataMediator.findPaymentMethodsForUser(userId);

            if (!remainingMethods.isEmpty()) {
                PaymentMethod nextDefault =
                        remainingMethods.get(0);

                nextDefault.setDefaultMethod(true);

                dataMediator.savePaymentMethod(
                        nextDefault
                );
            }
        }
    }

    private void clearDefaultMethods(
            List<PaymentMethod> paymentMethods
    ) {
        boolean changed = false;

        for (PaymentMethod paymentMethod : paymentMethods) {
            if (paymentMethod.isDefaultMethod()) {
                paymentMethod.setDefaultMethod(false);
                changed = true;
            }
        }

        if (changed) {
            dataMediator.saveAllPaymentMethods(
                    paymentMethods
            );
        }
    }

    private PaymentMethod findPaymentMethod(
            Long userId,
            Long paymentMethodId
    ) {
        return dataMediator.findPaymentMethod(
                        paymentMethodId,
                        userId
                )
                .orElseThrow(() -> new NotFoundException(
                        "Payment method not found: "
                                + paymentMethodId
                ));
    }

    private void ensureUserExists(
            Long userId
    ) {
        if (!dataMediator.userExists(userId)) {
            throw new NotFoundException(
                    "User not found: " + userId
            );
        }
    }

    private String normalizeRequiredValue(
            String value,
            String errorMessage
    ) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    errorMessage
            );
        }

        return value.trim();
    }

    private PaymentMethodDto toDto(
            PaymentMethod paymentMethod
    ) {
        return new PaymentMethodDto(
                paymentMethod.getId(),
                paymentMethod.getUser().getId(),
                paymentMethod.getCardholderName(),
                paymentMethod.getBrand(),
                paymentMethod.getLastFourDigits(),
                paymentMethod.getExpiryMonth(),
                paymentMethod.getExpiryYear(),
                paymentMethod.isDefaultMethod(),
                paymentMethod.getCreatedAt()
        );
    }
}