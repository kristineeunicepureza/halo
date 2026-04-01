package edu.cit.pureza.tutortime.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.entity.TutorProfile;
import edu.cit.pureza.tutortime.entity.AvailabilitySlot;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.repository.TutorProfileRepository;
import edu.cit.pureza.tutortime.repository.AvailabilitySlotRepository;
import edu.cit.pureza.tutortime.dto.ApiResponse;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tutors")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class TutorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @GetMapping
    public ApiResponse<List<Object>> getAllTutors() {
        List<User> tutors = userRepository.findAll().stream()
                .filter(u -> u.getRole().equals(User.UserRole.TUTOR))
                .collect(Collectors.toList());

        return ApiResponse.success(
                tutors.stream()
                        .map(this::mapTutorToDTO)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ApiResponse<Object> getTutorProfile(@PathVariable("id") Long id) {
        User tutor = userRepository.findById(id)
                .filter(u -> u.getRole().equals(User.UserRole.TUTOR))
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        return ApiResponse.success(mapTutorToDTO(tutor));
    }

    @GetMapping("/{id}/availability")
    public ApiResponse<List<Object>> getTutorAvailability(@PathVariable("id") Long id) {
        List<AvailabilitySlot> slots = availabilitySlotRepository.findByTutorIdAndIsBookedFalse(id);

        return ApiResponse.success(
                slots.stream()
                        .map(slot -> new Object() {
                            public Long id = slot.getId();
                            public String date = slot.getStartTime().toLocalDate().toString();
                            public String time = slot.getStartTime().toLocalTime().toString();
                            public String location = slot.getLocation();
                            public Boolean isBooked = slot.getIsBooked();
                            public String startTime = slot.getStartTime().toString();
                            public String endTime = slot.getEndTime().toString();
                        })
                        .collect(Collectors.toList()));
    }

    private Object mapTutorToDTO(User tutor) {
        TutorProfile profile = tutorProfileRepository.findByTutorId(tutor.getId()).orElse(null);

        return new Object() {
            public Long id = tutor.getId();
            public String firstName = tutor.getFirstName();
            public String lastName = tutor.getLastName();
            public String email = tutor.getEmail();
            public String bio = profile != null ? profile.getBio() : "";
            public String expertise = profile != null ? profile.getExpertise() : "";
            public Double rating = profile != null ? profile.getRating() : 0.0;
            public Integer reviewCount = profile != null ? profile.getReviewCount() : 0;
            public List<String> subjects = profile != null && profile.getSubjects() != null
                    ? List.of(profile.getSubjects().split(","))
                    : List.of();
            public String location = profile != null ? profile.getLocation() : "";
            public Boolean isVerified = profile != null ? profile.getIsVerified() : false;
        };
    }
}
