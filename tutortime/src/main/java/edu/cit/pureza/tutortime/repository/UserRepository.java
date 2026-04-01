package edu.cit.pureza.tutortime.repository;

import edu.cit.pureza.tutortime.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndVerificationStatus(User.UserRole role, User.VerificationStatus status);
}
