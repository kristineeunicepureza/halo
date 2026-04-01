package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.*;
import edu.cit.pureza.tutortime.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import edu.cit.pureza.tutortime.service.SupabaseService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class UserController {

    private final UserService userService;
    private final SupabaseService supabaseService;

    // ── GET /api/users/me ─────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getMe() {
        try {
            String email = currentEmail();
            UserProfileDto profile = userService.getProfile(email);
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("USER-001", ex.getMessage()));
        }
    }

    // ── PUT /api/users/me ─────────────────────────────────────────────────────
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateMe(
            @RequestBody UpdateProfileRequest request) {
        try {
            String email = currentEmail();
            UserProfileDto updated = userService.updateProfile(email, request);
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("USER-002", ex.getMessage()));
        }
    }

    // ── POST /api/users/me/photo ──────────────────────────────────────────────
    @PostMapping("/me/photo")
    public ResponseEntity<ApiResponse<UserProfileDto>> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            String email = currentEmail();
            UserProfileDto profile = userService.getProfile(email);

            String photoUrl = supabaseService.uploadProfilePhoto(file, profile.getId());

            UpdateProfileRequest req = new UpdateProfileRequest();
            req.setProfilePhotoUrl(photoUrl);
            UserProfileDto updated = userService.updateProfile(email, req);

            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PHOTO-001", ex.getMessage()));
        }
    }

    // ── PUT /api/users/me/password ────────────────────────────────────────────
    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            String email = currentEmail();
            userService.changePassword(email, request);
            return ResponseEntity.ok(ApiResponse.success("Password updated successfully."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("USER-003", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("USER-004", "An error occurred."));
        }
    }

    // ── GET /api/users (admin only) ───────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> listAllUsers() {
        try {
            List<UserProfileDto> users = userService.listAllUsers();
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("USER-005", ex.getMessage()));
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private String currentEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (principal instanceof UserDetails ud) ? ud.getUsername() : principal.toString();
    }
}