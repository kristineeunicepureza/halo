package edu.cit.pureza.tutortime.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.pureza.tutortime.entity.Booking;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStudentId(Long studentId);
    List<Booking> findByTutorId(Long tutorId);
}
