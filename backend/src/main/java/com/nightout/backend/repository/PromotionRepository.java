package com.nightout.backend.repository;

import com.nightout.backend.entity.Promotion;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    /*
     * Tutte le promozioni associate a uno specifico evento.
     */
    List<Promotion> findByEventIdOrderByValidFromDesc(Long eventId);

    /*
     * Tutte le promozioni appartenenti a un locale,
     * comprese quelle disattivate o scadute.
     * Serve nella dashboard del venue manager.
     */
    List<Promotion> findByVenueIdOrderByValidFromDesc(Long venueId);

    /*
     * Tutte le promozioni attivate dal venue manager.
     */
    List<Promotion> findByVenueIdAndActiveTrueOrderByValidFromDesc(Long venueId);

    /*
     * Promozioni attive e attualmente valide per un locale.
     *
     * Una promozione viene mostrata se:
     * - è attiva;
     * - la data di inizio è assente oppure già trascorsa;
     * - la data di fine è assente oppure non è ancora trascorsa.
     */
    @Query("""
            SELECT promotion
            FROM Promotion promotion
            WHERE promotion.venue.id = :venueId
              AND promotion.active = true
              AND (promotion.validFrom IS NULL OR promotion.validFrom <= :now)
              AND (promotion.validTo IS NULL OR promotion.validTo >= :now)
            ORDER BY promotion.validFrom DESC
            """)
    List<Promotion> findCurrentlyActiveByVenueId(
            @Param("venueId") Long venueId,
            @Param("now") LocalDateTime now
    );

    /*
     * Promozioni attive e attualmente valide
     * associate a uno specifico evento.
     */
    @Query("""
            SELECT promotion
            FROM Promotion promotion
            WHERE promotion.event.id = :eventId
              AND promotion.active = true
              AND (promotion.validFrom IS NULL OR promotion.validFrom <= :now)
              AND (promotion.validTo IS NULL OR promotion.validTo >= :now)
            ORDER BY promotion.validFrom DESC
            """)
    List<Promotion> findCurrentlyActiveByEventId(
            @Param("eventId") Long eventId,
            @Param("now") LocalDateTime now
    );
}