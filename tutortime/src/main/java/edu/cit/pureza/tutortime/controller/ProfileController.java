package edu.cit.pureza.tutortime.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import edu.cit.pureza.tutortime.entity.TutorProfile;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.TutorProfileRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.dto.TutorProfileDto;
import lombok.Data;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @PostMapping("/tutor")
    public ApiResponse<Object> updateTutorProfile(@RequestBody UpdateTutorProfileRequest request) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = (principal instanceof String) ? (String) principal : ((UserDetails) principal).getUsername();

            User tutor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (!tutor.getRole().equals(User.UserRole.TUTOR)) {
                return ApiResponse.error("INVALID_ROLE", "Only tutors can update tutor profile");
            }

            TutorProfile profile = tutorProfileRepository.findByTutorId(tutor.getId())
                .orElse(TutorProfile.builder()
                    .tutor(tutor)
                    .build());

            if (request.getBio() != null) profile.setBio(request.getBio());
            if (request.getExpertise() != null) profile.setExpertise(request.getExpertise());
            if (request.getSubjects() != null) profile.setSubjects(request.getSubjects());
            if (request.getLocation() != null) profile.setLocation(request.getLocation());

            TutorProfile savedProfile = tutorProfileRepository.save(profile);

            return ApiResponse.success(mapProfileToDTO(savedProfile));
        } catch (Exception e) {
            return ApiResponse.error("PROFILE_ERROR", e.getMessage());
        }
    }

    @GetMapping("/tutor")
    public ApiResponse<Object> getTutorProfile() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = (principal instanceof String) ? (String) principal : ((UserDetails) principal).getUsername();

            User tutor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            TutorProfile profile = tutorProfileRepository.findByTutorId(tutor.getId())
                .orElse(null);

            return ApiResponse.success(profile != null ? mapProfileToDTO(profile) : null);
        } catch (Exception e) {
            return ApiResponse.error("PROFILE_ERROR", e.getMessage());
        }
    }

    private Object mapProfileToDTO(TutorProfile profile) {
        return TutorProfileDto.builder()
                .id(profile.getId())
                .bio(profile.getBio())
                .expertise(profile.getExpertise())
                .subjects(profile.getSubjects())
                .location(profile.getLocation())
                .rating(profile.getRating())
                .reviewCount(profile.getReviewCount())
                .isVerified(profile.getIsVerified())
                .build();
    }
}

@Data
class UpdateTutorProfileRequest {
    private String bio;
    private String expertise;
    private String subjects;
    private String location;
}
