package edu.cit.pureza.tutortime.repository;

import edu.cit.pureza.tutortime.entity.TutoringLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TutoringLocationRepository extends JpaRepository<TutoringLocation, Long> {
    List<TutoringLocation> findByIsActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}