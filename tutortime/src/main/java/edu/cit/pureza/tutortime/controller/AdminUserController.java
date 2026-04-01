package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.AvailabilitySlotRepository;
import edu.cit.pureza.tutortime.repository.BookingRepository;
import edu.cit.pureza.tutortime.repository.TutorProfileRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AdminUserController {

    @Autowired private UserRepository             userRepository;
    @Autowired private TutorProfileRepository     tutorProfileRepository;
    @Autowired private BookingRepository          bookingRepository;
    @Autowired private AvailabilitySlotRepository availabilitySlotRepository;

    /**
     * DELETE /api/admin/users/{id}
     * Permanently removes a user and all their associated data.
     * Deletion order respects FK constraints:
     *   bookings → availability_slots → tutor_profile → user
     */
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {
        try {
            // Resolve the calling admin's email from the JWT principal
            Object principal = SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            String callerEmail = (principal instanceof UserDetails ud)
                    ? ud.getUsername()
                    : principal.toString();

            User target = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Prevent an admin from deleting their own account
            if (target.getEmail().equalsIgnoreCase(callerEmail)) {
                return ApiResponse.error("SELF_DELETE",
                        "You cannot delete your own account.");
            }

            // 1. Delete all bookings where this user is the student OR the tutor
            bookingRepository.deleteAll(bookingRepository.findByStudentId(id));
            bookingRepository.deleteAll(bookingRepository.findByTutorId(id));

            // 2. Delete availability slots if the user is a tutor
            availabilitySlotRepository.deleteAll(
                    availabilitySlotRepository.findByTutorId(id));

            // 3. Delete tutor profile if it exists
            tutorProfileRepository.findByTutorId(id)
                    .ifPresent(tutorProfileRepository::delete);

            // 4. Finally delete the user
            String displayName = target.getFirstName() + " " + target.getLastName();
            userRepository.delete(target);

            return ApiResponse.success("User \"" + displayName + "\" deleted successfully.");

        } catch (RuntimeException e) {
            return ApiResponse.error("ADMIN_ERROR", e.getMessage());
        }
    }
}