package edu.cit.pureza.tutortime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorProfileDto {
    private Long id;
    private String bio;
    private String expertise;
    private String subjects;
    private String location;
    private Double rating;
    private Integer reviewCount;
    private Boolean isVerified;
}
