package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.dto.UserProfileDto;
import edu.cit.pureza.tutortime.entity.TutorProfile;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.TutorProfileRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.service.NotificationService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/tutors")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AdminTutorController {

    @Autowired private UserRepository        userRepository;
    @Autowired private NotificationService   notificationService;
    @Autowired private TutorProfileRepository tutorProfileRepository;

    /** GET all tutors with PENDING verification */
    @GetMapping("/pending")
    public ApiResponse<List<UserProfileDto>> getPendingTutors() {
        try {
            List<UserProfileDto> list = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.UserRole.TUTOR
                            && u.getVerificationStatus() == User.VerificationStatus.PENDING)
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error("ADMIN_ERROR", e.getMessage());
        }
    }

    /** GET all tutors (any status) */
    @GetMapping
    public ApiResponse<List<UserProfileDto>> getAllTutors() {
        try {
            List<UserProfileDto> list = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.UserRole.TUTOR)
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error("ADMIN_ERROR", e.getMessage());
        }
    }

    /** PATCH approve a tutor */
    @PatchMapping("/{id}/approve")
    public ApiResponse<UserProfileDto> approveTutor(@PathVariable Long id) {
        try {
            User tutor = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (tutor.getRole() != User.UserRole.TUTOR) {
                return ApiResponse.error("INVALID_ROLE", "User is not a tutor.");
            }

            tutor.setVerificationStatus(User.VerificationStatus.APPROVED);
            userRepository.save(tutor);

            // Also mark TutorProfile as verified
            tutorProfileRepository.findByTutorId(id).ifPresent(profile -> {
                profile.setIsVerified(true);
                tutorProfileRepository.save(profile);
            });

            // Notify the tutor
            notificationService.notifyTutorApproved(tutor.getId(), tutor.getFirstName());

            return ApiResponse.success(toDto(tutor));
        } catch (Exception e) {
            return ApiResponse.error("ADMIN_ERROR", e.getMessage());
        }
    }

    /** PATCH reject a tutor */
    @PatchMapping("/{id}/reject")
    public ApiResponse<UserProfileDto> rejectTutor(
            @PathVariable Long id,
            @RequestBody(required = false) TutorRejectRequest body) {
        try {
            User tutor = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (tutor.getRole() != User.UserRole.TUTOR) {
                return ApiResponse.error("INVALID_ROLE", "User is not a tutor.");
            }

            tutor.setVerificationStatus(User.VerificationStatus.REJECTED);
            // Optionally deactivate
            tutor.setIsActive(false);
            userRepository.save(tutor);

            return ApiResponse.success(toDto(tutor));
        } catch (Exception e) {
            return ApiResponse.error("ADMIN_ERROR", e.getMessage());
        }
    }

    private UserProfileDto toDto(User u) {
        UserProfileDto.UserProfileDtoBuilder b = UserProfileDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .role(u.getRole())
                .profilePhotoUrl(u.getProfilePhotoUrl())
                .verificationStatus(u.getVerificationStatus());

        tutorProfileRepository.findByTutorId(u.getId()).ifPresent(p -> {
            b.bio(p.getBio())
             .expertise(p.getExpertise())
             .subjects(p.getSubjects())
             .location(p.getLocation())
             .rating(p.getRating())
             .reviewCount(p.getReviewCount())
             .isVerified(p.getIsVerified());
        });

        return b.build();
    }
}

@Data
class TutorRejectRequest {
    private String reason;
}