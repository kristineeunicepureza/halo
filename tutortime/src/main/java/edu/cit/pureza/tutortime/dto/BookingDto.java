package edu.cit.pureza.tutortime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long tutorId;
    private String tutorName;
    private String subject;
    private String notes;
    private String status;
    private LocalDateTime scheduledTime;
    private LocalDateTime createdAt;
    private String cancellationReason;
    private String rejectionReason;
    private Long availabilitySlotId;
}