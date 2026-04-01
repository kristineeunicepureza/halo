package edu.cit.pureza.tutortime.service;

import edu.cit.pureza.tutortime.dto.*;
import edu.cit.pureza.tutortime.entity.TutorProfile;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.entity.User.UserRole;
import edu.cit.pureza.tutortime.repository.TutorProfileRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository        userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final PasswordEncoder       passwordEncoder;

    // ── Get current user's full profile ──────────────────────────────────────
    public UserProfileDto getProfile(String email) {
        User user = findByEmail(email);
        return buildProfileDto(user);
    }

    // ── Update profile ────────────────────────────────────────────────────────
    @Transactional
    public UserProfileDto updateProfile(String email, UpdateProfileRequest req) {
        User user = findByEmail(email);

        if (req.getFirstName()       != null) user.setFirstName(req.getFirstName().trim());
        if (req.getLastName()        != null) user.setLastName(req.getLastName().trim());
        if (req.getMiddleInitial()   != null) user.setMiddleInitial(req.getMiddleInitial());
        if (req.getProfilePhotoUrl() != null) user.setProfilePhotoUrl(req.getProfilePhotoUrl());

        userRepository.save(user);

        // Tutor-specific fields
        if (user.getRole() == UserRole.TUTOR) {
            TutorProfile profile = tutorProfileRepository.findByTutorId(user.getId())
                    .orElse(TutorProfile.builder().tutor(user).build());

            if (req.getBio()       != null) profile.setBio(req.getBio());
            if (req.getExpertise() != null) profile.setExpertise(req.getExpertise());
            if (req.getSubjects()  != null) profile.setSubjects(req.getSubjects());
            if (req.getLocation()  != null) profile.setLocation(req.getLocation());

            tutorProfileRepository.save(profile);
        }

        return buildProfileDto(user);
    }

    // ── Change password ───────────────────────────────────────────────────────
    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new IllegalArgumentException("New passwords do not match.");
        }

        User user = findByEmail(email);

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // ── Admin: list all users ─────────────────────────────────────────────────
    public List<UserProfileDto> listAllUsers() {
        return userRepository.findAll().stream()
                .map(this::buildProfileDto)
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserProfileDto buildProfileDto(User user) {
        UserProfileDto.UserProfileDtoBuilder b = UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .middleInitial(user.getMiddleInitial())
                .role(user.getRole())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .verificationStatus(user.getVerificationStatus()); // ← required for tutor approval gate

        if (user.getRole() == UserRole.TUTOR) {
            tutorProfileRepository.findByTutorId(user.getId()).ifPresent(p -> {
                b.bio(p.getBio())
                 .expertise(p.getExpertise())
                 .subjects(p.getSubjects())
                 .location(p.getLocation())
                 .rating(p.getRating())
                 .reviewCount(p.getReviewCount())
                 .isVerified(p.getIsVerified());
            });
        }

        return b.build();
    }
}