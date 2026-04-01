package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.repository.BookingRepository;
import edu.cit.pureza.tutortime.entity.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class UserStatsController {
    private final BookingRepository bookingRepository;

    @GetMapping("/tutor/{tutorId}")
    public Map<String, Object> getTutorStats(@PathVariable Long tutorId) {
        List<Booking> bookings = bookingRepository.findByTutorId(tutorId);
        long upcoming = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count();
        long completed = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("upcomingSessions", upcoming);
        stats.put("completedSessions", completed);
        stats.put("hoursTaught", completed); // Assuming 1 hour per session
        return stats;
    }

    @GetMapping("/student/{studentId}")
    public Map<String, Object> getStudentStats(@PathVariable Long studentId) {
        List<Booking> bookings = bookingRepository.findByStudentId(studentId);
        long upcoming = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count();
        long completed = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("upcomingSessions", upcoming);
        stats.put("completedSessions", completed);
        stats.put("totalBookings", (long) bookings.size());
        return stats;
    }
}
