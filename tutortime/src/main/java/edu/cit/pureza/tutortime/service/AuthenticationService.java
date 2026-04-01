package edu.cit.pureza.tutortime.service;

import edu.cit.pureza.tutortime.dto.AuthResponse;
import edu.cit.pureza.tutortime.dto.LoginRequest;
import edu.cit.pureza.tutortime.dto.RegisterRequest;
import edu.cit.pureza.tutortime.dto.UserDto;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.security.JwtTokenProvider;
import edu.cit.pureza.tutortime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final String CIT_DOMAIN   = "@cit.edu";
    private static final String ADMIN_DOMAIN = "@tutortime.com";

    private final UserRepository  userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder  passwordEncoder;
    private final NotificationService notificationService;

    // ──────────────────────────────────────────────────────────────────────────
    // REGISTER
    // ──────────────────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // 1. Passwords must match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // 2. Registration is only allowed for @cit.edu addresses
        String email = request.getEmail().trim().toLowerCase();
        if (!email.endsWith(CIT_DOMAIN)) {
            throw new IllegalArgumentException(
                    "Registration is only available for CIT students and tutors. " +
                    "Please use your institutional @cit.edu email address.");
        }

        // 3. Duplicate check
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // 4. Role default
        User.UserRole role = (request.getRole() != null) ? request.getRole() : User.UserRole.STUDENT;

        // ADMIN role cannot be self-registered
        if (role == User.UserRole.ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be created through registration.");
        }

        // 5. Persist
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .middleInitial(request.getMiddleInitial())
                .role(role)
                // Tutors must wait for admin approval; students are not subject to verification
                .verificationStatus(role == User.UserRole.TUTOR
                        ? User.VerificationStatus.PENDING
                        : User.VerificationStatus.NOT_APPLICABLE)
                .build();

        User saved = userRepository.save(user);

        // Notify admins when a new tutor registers
        if (role == User.UserRole.TUTOR) {
            notificationService.notifyTutorRegistered(
                    saved.getFirstName() + " " + saved.getLastName());
        }

        String token        = jwtTokenProvider.generateToken(saved.getEmail(), saved.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(saved.getEmail(), saved.getId());

        return AuthResponse.of(UserDto.fromEntity(saved), token, refreshToken);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // LOGIN
    // ──────────────────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        // Only @cit.edu or @tutortime.com (admin) addresses are accepted
        boolean isCitEmail   = email.endsWith(CIT_DOMAIN);
        boolean isAdminEmail = email.endsWith(ADMIN_DOMAIN);

        if (!isCitEmail && !isAdminEmail) {
            throw new IllegalArgumentException(
                    "Only @cit.edu or authorised administrative accounts may log in.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new IllegalArgumentException("Your account has been deactivated. Please contact an administrator.");
        }

        String token        = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail(), user.getId());

        return AuthResponse.of(UserDto.fromEntity(user), token, refreshToken);
    }
}