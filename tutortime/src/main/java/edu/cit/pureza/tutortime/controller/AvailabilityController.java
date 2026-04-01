package edu.cit.pureza.tutortime.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import edu.cit.pureza.tutortime.entity.AvailabilitySlot;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.AvailabilitySlotRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.dto.AvailabilitySlotDto;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AvailabilityController {

    private static final int SLOT_MINUTES = 30;

    @Autowired private UserRepository             userRepository;
    @Autowired private AvailabilitySlotRepository availabilitySlotRepository;

    @PostMapping
    public ApiResponse<Object> addAvailabilitySlots(@RequestBody CreateAvailabilityRequest request) {
        try {
            String email = extractEmail();
            User tutor = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!tutor.getRole().equals(User.UserRole.TUTOR))
                return ApiResponse.error("INVALID_ROLE", "Only tutors can add availability.");

            if (request.getSubject() == null || request.getSubject().isBlank())
                return ApiResponse.error("MISSING_SUBJECT", "A subject is required.");
            if (request.getLocation() == null || request.getLocation().isBlank())
                return ApiResponse.error("MISSING_LOCATION", "A location is required.");

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime windowStart = LocalDateTime.parse(request.getStartTime(), fmt);
            LocalDateTime windowEnd   = LocalDateTime.parse(request.getEndTime(),   fmt);

            if (!windowEnd.isAfter(windowStart))
                return ApiResponse.error("INVALID_RANGE", "End time must be after start time.");
            if (windowStart.plusMinutes(SLOT_MINUTES).isAfter(windowEnd))
                return ApiResponse.error("INVALID_RANGE", "Window must be at least 30 minutes.");
            if (windowStart.toLocalDate().isBefore(LocalDate.now()))
                return ApiResponse.error("PAST_DATE", "Cannot set availability for past dates.");
            if (windowStart.isBefore(LocalDateTime.now()))
                return ApiResponse.error("PAST_TIME", "Start time is in the past.");

            List<AvailabilitySlot> conflicts =
                    availabilitySlotRepository.findOverlapping(tutor.getId(), windowStart, windowEnd);
            if (!conflicts.isEmpty()) {
                AvailabilitySlot first = conflicts.get(0);
                DateTimeFormatter d = DateTimeFormatter.ofPattern("MMM d, h:mm a");
                return ApiResponse.error("SLOT_CONFLICT",
                        "Overlaps with an existing slot: "
                        + first.getStartTime().format(d) + " – " + first.getEndTime().format(d));
            }

            List<AvailabilitySlotDto> created = new ArrayList<>();
            LocalDateTime cursor = windowStart;
            while (cursor.plusMinutes(SLOT_MINUTES).compareTo(windowEnd) <= 0) {
                LocalDateTime slotEnd = cursor.plusMinutes(SLOT_MINUTES);
                created.add(mapToDto(availabilitySlotRepository.save(
                        AvailabilitySlot.builder()
                                .tutor(tutor)
                                .startTime(cursor)
                                .endTime(slotEnd)
                                .location(request.getLocation().trim())
                                .subject(request.getSubject().trim())
                                .isBooked(false)
                                .build())));
                cursor = slotEnd;
            }
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("AVAILABILITY_ERROR", e.getMessage());
        }
    }

    @GetMapping("/my-slots")
    public ApiResponse<List<Object>> getMySlots() {
        try {
            User tutor = userRepository.findByEmail(extractEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ApiResponse.success(
                    availabilitySlotRepository.findByTutorId(tutor.getId())
                            .stream().map(this::mapToDto).collect(Collectors.toList()));
        } catch (Exception e) {
            return ApiResponse.error("AVAILABILITY_ERROR", e.getMessage());
        }
    }

    /** Student-facing: available slots for a specific tutor */
    @GetMapping("/tutor/{tutorId}")
    public ApiResponse<List<Object>> getTutorSlots(@PathVariable Long tutorId) {
        try {
            return ApiResponse.success(
                    availabilitySlotRepository.findByTutorIdAndIsBookedFalse(tutorId)
                            .stream().map(this::mapToDto).collect(Collectors.toList()));
        } catch (Exception e) {
            return ApiResponse.error("AVAILABILITY_ERROR", e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteSlot(@PathVariable Long id) {
        try {
            AvailabilitySlot slot = availabilitySlotRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Slot not found"));
            if (slot.getIsBooked())
                return ApiResponse.error("SLOT_BOOKED", "Cannot delete a booked slot.");
            availabilitySlotRepository.deleteById(id);
            return ApiResponse.success("Slot deleted.");
        } catch (Exception e) {
            return ApiResponse.error("AVAILABILITY_ERROR", e.getMessage());
        }
    }

    private String extractEmail() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (p instanceof UserDetails ud) ? ud.getUsername() : p.toString();
    }

    private AvailabilitySlotDto mapToDto(AvailabilitySlot s) {
        return AvailabilitySlotDto.builder()
                .id(s.getId())
                .startTime(s.getStartTime().toString())
                .endTime(s.getEndTime().toString())
                .location(s.getLocation())
                .subject(s.getSubject())
                .isBooked(s.getIsBooked())
                .date(s.getStartTime().toLocalDate().toString())
                .time(s.getStartTime().toLocalTime().toString())
                .tutorId(s.getTutor().getId())
                .tutorName(s.getTutor().getFirstName() + " " + s.getTutor().getLastName())
                .build();
    }
}

@Data class CreateAvailabilityRequest {
    private String startTime;
    private String endTime;
    private String location;
    private String subject;
}