package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.repository.BookingRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.entity.Booking;
import edu.cit.pureza.tutortime.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeSessions", bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED));
        stats.put("pendingReviews", (long) userRepository.findByRoleAndVerificationStatus(User.UserRole.TUTOR, User.VerificationStatus.PENDING).size());
        return stats;
    }
}
