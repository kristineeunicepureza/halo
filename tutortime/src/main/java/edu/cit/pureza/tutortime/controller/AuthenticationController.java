package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.dto.AuthResponse;
import edu.cit.pureza.tutortime.dto.LoginRequest;
import edu.cit.pureza.tutortime.dto.RegisterRequest;
import edu.cit.pureza.tutortime.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    // ── Register ──────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authenticationService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("VALID-001", ex.getMessage()));
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authenticationService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("AUTH-001", ex.getMessage()));
        }
    }

    // ── Logout ────────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // JWT is stateless; client removes the token.
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    // ── Bean-validation error handler (returns field messages to the client) ──
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("VALID-002", message));
    }
}