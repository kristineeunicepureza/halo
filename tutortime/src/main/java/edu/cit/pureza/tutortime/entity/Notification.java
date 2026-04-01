package edu.cit.pureza.tutortime.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who should receive this notification */
    @Column(nullable = false)
    private Long recipientId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    /** Optional booking/tutor id for deep-linking */
    private Long referenceId;

    @Column(nullable = false) @Builder.Default
    private Boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) this.isRead = false;
    }

    public enum NotificationType {
        BOOKING_CREATED,        // → tutor
        BOOKING_CONFIRMED,      // → student
        BOOKING_CANCELLED,      // → both
        BOOKING_REJECTED,       // → student
        TUTOR_REGISTERED,       // → admin
        TUTOR_APPROVED,         // → tutor
        SESSION_COMPLETED,      // → student (session completed successfully)
        SESSION_NO_SHOW_STUDENT,// → student (student missed session)
        SESSION_NO_SHOW_TUTOR   // → student (tutor missed session)
    }
}