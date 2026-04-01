package edu.cit.pureza.tutortime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    /**
     * Accepts both @cit.edu (students/tutors) and @tutortime.com (admin).
     */
    @Email(message = "Email must be a valid address")
    @NotBlank(message = "Email is required")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+\\-]+@(cit\\.edu|tutortime\\.com)$",
        message = "Only @cit.edu or authorised @tutortime.com addresses are accepted"
    )
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}