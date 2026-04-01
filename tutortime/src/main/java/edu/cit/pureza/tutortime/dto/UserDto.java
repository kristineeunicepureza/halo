package edu.cit.pureza.tutortime.dto;

import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.entity.User.UserRole;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String middleInitial;
    private UserRole role;
    private String profilePhotoUrl;

    public static UserDto fromEntity(User u) {
        return UserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .middleInitial(u.getMiddleInitial())
                .role(u.getRole())
                .profilePhotoUrl(u.getProfilePhotoUrl())
                .build();
    }
}