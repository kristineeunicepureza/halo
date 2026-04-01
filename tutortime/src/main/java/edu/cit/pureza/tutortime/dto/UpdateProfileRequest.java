package edu.cit.pureza.tutortime.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String middleInitial;
    private String profilePhotoUrl;

    // Tutor-specific (ignored for students/admin)
    private String bio;
    private String expertise;
    private String subjects;
    private String location;
}