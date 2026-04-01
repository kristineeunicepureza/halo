package edu.cit.pureza.tutortime.repository;

import edu.cit.pureza.tutortime.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);

    @Modifying @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :uid AND n.isRead = false")
    void markAllReadForUser(@Param("uid") Long recipientId);
}