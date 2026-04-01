package edu.cit.pureza.tutortime.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.pureza.tutortime.entity.TutorProfile;
import java.util.Optional;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {
    Optional<TutorProfile> findByTutorId(Long tutorId);
}
