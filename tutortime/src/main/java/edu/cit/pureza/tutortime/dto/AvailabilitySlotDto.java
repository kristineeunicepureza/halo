package edu.cit.pureza.tutortime.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AvailabilitySlotDto {
    private Long    id;
    private String  startTime;
    private String  endTime;
    private String  location;
    private String  subject;
    private Boolean isBooked;
    private String  date;
    private String  time;
    private Long    tutorId;
    private String  tutorName;
}