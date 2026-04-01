package edu.cit.pureza.tutortime.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import edu.cit.pureza.tutortime.entity.AvailabilitySlot;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByTutorId(Long tutorId);

    List<AvailabilitySlot> findByTutorIdAndIsBookedFalse(Long tutorId);

    /**
     * Find any existing slots for this tutor that overlap with the given window.
     * Two slots overlap when: existingStart < windowEnd AND existingEnd > windowStart
     */
    @Query("""
        SELECT s FROM AvailabilitySlot s
        WHERE s.tutor.id = :tutorId
          AND s.startTime < :windowEnd
          AND s.endTime   > :windowStart
    """)
    List<AvailabilitySlot> findOverlapping(
            @Param("tutorId")      Long          tutorId,
            @Param("windowStart")  LocalDateTime windowStart,
            @Param("windowEnd")    LocalDateTime windowEnd
    );
}