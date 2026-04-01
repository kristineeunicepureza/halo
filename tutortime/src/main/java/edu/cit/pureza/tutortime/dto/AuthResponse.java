package edu.cit.pureza.tutortime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private UserDto user;
    private String token;
    private String refreshToken;
    private String tokenType;

    public static AuthResponse of(UserDto user, String token, String refreshToken) {
        return AuthResponse.builder()
                .user(user)
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }
}
