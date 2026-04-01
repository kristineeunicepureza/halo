package edu.cit.pureza.tutortime.dto;

import edu.cit.pureza.tutortime.entity.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    /**
     * Must be a valid @cit.edu address.
     * The service layer also enforces this; the annotation provides an early,
     * descriptive error message before business logic runs.
     */
    @Email(message = "Email must be a valid address")
    @NotBlank(message = "Email is required")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+\\-]+@cit\\.edu$",
        message = "Only @cit.edu email addresses are accepted for registration"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String middleInitial;

    private UserRole role;
}