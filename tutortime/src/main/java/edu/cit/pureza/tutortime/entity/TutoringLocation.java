package edu.cit.pureza.tutortime.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "tutoring_locations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TutoringLocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(nullable = false) @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}