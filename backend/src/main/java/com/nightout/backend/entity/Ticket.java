package com.nightout.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;

@Entity
public class Ticket {

    private static final long CONFIRMATION_TIMEOUT_MINUTES = 15;

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String code;

    @ManyToOne
    private AppUser user;

    @ManyToOne
    private Event event;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    private String ticketType;

    private double pricePaid;

    private LocalDateTime createdAt;

    /*
     * Momento entro il quale un ticket PENDING
     * deve essere confermato.
     */
    private LocalDateTime confirmationDeadline;

    private String salesChannel;

    private String qrPayload;

    @ManyToOne
    private PrEventAssignment prAssignment;

    private String promoCodeUsed;

    private double discountAmount;

    private double commissionAmount;

    private LocalDateTime checkedInAt;

    public Ticket() {
    }

    public Ticket(
            String code,
            AppUser user,
            Event event,
            TicketStatus status,
            String ticketType,
            double pricePaid,
            LocalDateTime createdAt,
            String salesChannel,
            String qrPayload
    ) {
        this.code = code;
        this.user = user;
        this.event = event;

        /*
         * Ogni nuovo ticket deve iniziare
         * nello stato PENDING.
         */
        changeStatus(status);

        this.ticketType = ticketType;
        this.pricePaid = pricePaid;

        LocalDateTime ticketCreationTime =
                createdAt != null
                        ? createdAt
                        : LocalDateTime.now();

        this.createdAt = ticketCreationTime;

        this.confirmationDeadline =
                ticketCreationTime.plusMinutes(
                        CONFIRMATION_TIMEOUT_MINUTES
                );

        this.salesChannel = salesChannel;
        this.qrPayload = qrPayload;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(
            String code
    ) {
        this.code = code;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(
            AppUser user
    ) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(
            Event event
    ) {
        this.event = event;
    }

    public TicketStatus getStatus() {
        return status;
    }

    /*
     * Gestisce le transizioni della macchina a stati
     * del ciclo di vita del ticket.
     */
    public void changeStatus(
            TicketStatus newStatus
    ) {
        if (newStatus == null) {
            throw new IllegalArgumentException(
                    "Ticket status cannot be null."
            );
        }

        /*
         * Stato iniziale del ticket.
         */
        if (this.status == null) {
            if (newStatus != TicketStatus.PENDING) {
                throw new IllegalStateException(
                        "A new ticket must start as PENDING."
                );
            }

            this.status = newStatus;
            return;
        }

        boolean validTransition =
                switch (this.status) {

                    case PENDING ->
                            newStatus
                                    == TicketStatus.CONFIRMED
                                    || newStatus
                                    == TicketStatus.WAITING_LIST
                                    || newStatus
                                    == TicketStatus.EXPIRED
                                    || newStatus
                                    == TicketStatus.CANCELLED;

                    case WAITING_LIST ->
                            newStatus
                                    == TicketStatus.CONFIRMED
                                    || newStatus
                                    == TicketStatus.EXPIRED
                                    || newStatus
                                    == TicketStatus.CANCELLED;

                    case CONFIRMED ->
                            newStatus
                                    == TicketStatus.EXPIRED
                                    || newStatus
                                    == TicketStatus.CANCELLED;

                    /*
                     * EXPIRED e CANCELLED sono stati finali.
                     */
                    case EXPIRED, CANCELLED -> false;

                    /*
                     * Protezione nel caso TicketStatus
                     * contenga altri valori.
                     */
                    default -> false;
                };

        if (!validTransition) {
            throw new IllegalStateException(
                    "Invalid ticket transition: "
                            + this.status
                            + " -> "
                            + newStatus
            );
        }

        this.status = newStatus;
    }

    public boolean isActive() {
        return status == TicketStatus.PENDING
                || status == TicketStatus.CONFIRMED
                || status == TicketStatus.WAITING_LIST;
    }

    /*
     * Restituisce true quando il ticket è ancora
     * PENDING e il tempo disponibile è terminato.
     */
    public boolean isConfirmationExpired(
            LocalDateTime currentTime
    ) {
        if (currentTime == null) {
            throw new IllegalArgumentException(
                    "Current time cannot be null."
            );
        }

        return status == TicketStatus.PENDING
                && confirmationDeadline != null
                && !confirmationDeadline.isAfter(
                        currentTime
                );
    }

    public String getTicketType() {
        return ticketType;
    }

    public void setTicketType(
            String ticketType
    ) {
        this.ticketType = ticketType;
    }

    public double getPricePaid() {
        return pricePaid;
    }

    public void setPricePaid(
            double pricePaid
    ) {
        this.pricePaid = pricePaid;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getConfirmationDeadline() {
        return confirmationDeadline;
    }

    public void setConfirmationDeadline(
            LocalDateTime confirmationDeadline
    ) {
        this.confirmationDeadline =
                confirmationDeadline;
    }

    public String getSalesChannel() {
        return salesChannel;
    }

    public void setSalesChannel(
            String salesChannel
    ) {
        this.salesChannel = salesChannel;
    }

    public String getQrPayload() {
        return qrPayload;
    }

    public void setQrPayload(
            String qrPayload
    ) {
        this.qrPayload = qrPayload;
    }

    public PrEventAssignment getPrAssignment() {
        return prAssignment;
    }

    public void setPrAssignment(
            PrEventAssignment prAssignment
    ) {
        this.prAssignment = prAssignment;
    }

    public String getPromoCodeUsed() {
        return promoCodeUsed;
    }

    public void setPromoCodeUsed(
            String promoCodeUsed
    ) {
        this.promoCodeUsed = promoCodeUsed;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(
            double discountAmount
    ) {
        this.discountAmount = discountAmount;
    }

    public double getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(
            double commissionAmount
    ) {
        this.commissionAmount =
                commissionAmount;
    }

    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(
            LocalDateTime checkedInAt
    ) {
        this.checkedInAt = checkedInAt;
    }
}