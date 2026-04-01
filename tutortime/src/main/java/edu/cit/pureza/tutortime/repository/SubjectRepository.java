package edu.cit.pureza.tutortime.repository;

import edu.cit.pureza.tutortime.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByIsActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}