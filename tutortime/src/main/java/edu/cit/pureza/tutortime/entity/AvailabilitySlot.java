package edu.cit.pureza.tutortime.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "availability_slots")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AvailabilitySlot {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    /** Selected from the admin-managed location list */
    @Column(length = 255)
    private String location;

    /** Selected from the admin-managed subject list */
    @Column(length = 255)
    private String subject;

    @Column(nullable = false)
    private Boolean isBooked;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isBooked == null) this.isBooked = false;
    }

    @PreUpdate protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}