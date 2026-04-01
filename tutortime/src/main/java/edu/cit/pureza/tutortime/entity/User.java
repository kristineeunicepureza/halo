package edu.cit.pureza.tutortime.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(length = 1)
    private String middleInitial;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(length = 1000)
    private String profilePhotoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.NOT_APPLICABLE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive  = true;

        // @Builder.Default sets NOT_APPLICABLE before this runs, so we cannot rely on
        // a null check.  Instead, always enforce the correct status for each role.
        if (this.role == UserRole.TUTOR) {
            // Only override if not already explicitly set to APPROVED / REJECTED
            if (this.verificationStatus == null
                    || this.verificationStatus == VerificationStatus.NOT_APPLICABLE) {
                this.verificationStatus = VerificationStatus.PENDING;
            }
        } else {
            this.verificationStatus = VerificationStatus.NOT_APPLICABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        STUDENT, TUTOR, ADMIN
    }

    public enum VerificationStatus {
        NOT_APPLICABLE,   // students & admins
        PENDING,          // tutor awaiting admin review
        APPROVED,         // tutor approved
        REJECTED          // tutor rejected
    }
}