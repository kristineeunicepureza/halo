package edu.cit.pureza.tutortime.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tutor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "tutor_id", nullable = false, unique = true)
    private User tutor;

    @Column(length = 1000)
    private String bio;

    @Column(length = 500)
    private String expertise;

    @Column(length = 255)
    private String subjects;

    @Column(length = 255)
    private String location;

    @Column
    private Double rating;

    @Column
    private Integer reviewCount;

    @Column(nullable = false)
    private Boolean isVerified;

    @Column(length = 1000)
    private String profilePhotoUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isVerified == null) {
            this.isVerified = false;
        }
        if (this.rating == null) {
            this.rating = 0.0;
        }
        if (this.reviewCount == null) {
            this.reviewCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
