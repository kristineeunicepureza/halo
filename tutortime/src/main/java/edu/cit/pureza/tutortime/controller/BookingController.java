package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.dto.BookingDto;
import edu.cit.pureza.tutortime.entity.AvailabilitySlot;
import edu.cit.pureza.tutortime.entity.Booking;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.AvailabilitySlotRepository;
import edu.cit.pureza.tutortime.repository.BookingRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.service.NotificationService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class BookingController {

    @Autowired private BookingRepository          bookingRepository;
    @Autowired private UserRepository             userRepository;
    @Autowired private AvailabilitySlotRepository slotRepository;
    @Autowired private NotificationService        notificationService;

    @PostMapping
    public ApiResponse<Object> createBooking(@RequestBody CreateBookingRequest request) {
        try {
            String email   = currentEmail();
            User   student = findUser(email);
            User   tutor   = userRepository.findById(request.getTutorId())
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime scheduled = LocalDateTime.parse(request.getScheduledTime(), fmt);

            AvailabilitySlot slot = null;
            if (request.getAvailabilitySlotId() != null) {
                slot = slotRepository.findById(request.getAvailabilitySlotId())
                        .orElseThrow(() -> new RuntimeException("Slot not found"));
                if (slot.getIsBooked())
                    return ApiResponse.error("SLOT_TAKEN", "This slot has already been booked.");
                slot.setIsBooked(true);
                slotRepository.save(slot);
            }

            // Use subject from slot if available, otherwise from request
            String subject = (slot != null && slot.getSubject() != null)
                    ? slot.getSubject()
                    : (request.getSubject() != null ? request.getSubject() : "General Tutoring");

            Booking booking = bookingRepository.save(Booking.builder()
                    .student(student).tutor(tutor)
                    .subject(subject)
                    .notes(request.getNotes())
                    .scheduledTime(scheduled)
                    .availabilitySlot(slot)
                    .build());

            // Notify tutor of new booking
            notificationService.notifyBookingCreated(
                    tutor.getId(),
                    student.getFirstName() + " " + student.getLastName(),
                    subject, booking.getId());

            return ApiResponse.success(toDto(booking));
        } catch (Exception e) {
            return ApiResponse.error("BOOKING_ERROR", e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    public ApiResponse<Object> getMyBookings() {
        try {
            User user = findUser(currentEmail());
            List<BookingDto> list = bookingRepository.findByStudentId(user.getId())
                    .stream().map(this::toDto).toList();
            return ApiResponse.success(list);
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @GetMapping("/tutor-bookings")
    public ApiResponse<Object> getTutorBookings() {
        try {
            User tutor = findUser(currentEmail());
            List<BookingDto> list = bookingRepository.findByTutorId(tutor.getId())
                    .stream().map(this::toDto).toList();
            return ApiResponse.success(list);
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @GetMapping("/all")
    public ApiResponse<Object> getAllBookings() {
        try {
            return ApiResponse.success(bookingRepository.findAll().stream().map(this::toDto).toList());
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @PatchMapping("/{id}/confirm")
    public ApiResponse<Object> confirmBooking(@PathVariable Long id) {
        try {
            Booking b = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (b.getStatus() != Booking.BookingStatus.PENDING)
                return ApiResponse.error("INVALID_STATUS", "Only PENDING bookings can be confirmed.");
            b.setStatus(Booking.BookingStatus.CONFIRMED);
            bookingRepository.save(b);

            notificationService.notifyBookingConfirmed(
                    b.getStudent().getId(),
                    b.getTutor().getFirstName() + " " + b.getTutor().getLastName(),
                    b.getSubject(), b.getId());

            return ApiResponse.success(toDto(b));
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<Object> rejectBooking(@PathVariable Long id,
                                             @RequestBody(required = false) ReasonRequest body) {
        try {
            Booking b = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (b.getStatus() != Booking.BookingStatus.PENDING)
                return ApiResponse.error("INVALID_STATUS", "Only PENDING bookings can be rejected.");
            b.setStatus(Booking.BookingStatus.REJECTED);
            if (body != null) b.setRejectionReason(body.getReason());
            releaseSlot(b);
            bookingRepository.save(b);

            notificationService.notifyBookingRejected(
                    b.getStudent().getId(),
                    b.getTutor().getFirstName() + " " + b.getTutor().getLastName(),
                    b.getSubject(), b.getId());

            return ApiResponse.success(toDto(b));
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<Object> cancelBooking(@PathVariable Long id,
                                             @RequestBody(required = false) ReasonRequest body) {
        try {
            Booking b = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (b.getStatus() == Booking.BookingStatus.CANCELLED
                    || b.getStatus() == Booking.BookingStatus.COMPLETED)
                return ApiResponse.error("INVALID_STATUS", "Booking cannot be cancelled.");

            String cancellerName = currentEmail().equals(b.getStudent().getEmail())
                    ? b.getStudent().getFirstName() + " " + b.getStudent().getLastName()
                    : b.getTutor().getFirstName() + " " + b.getTutor().getLastName();

            b.setStatus(Booking.BookingStatus.CANCELLED);
            if (body != null) b.setCancellationReason(body.getReason());
            releaseSlot(b);
            bookingRepository.save(b);

            notificationService.notifyBookingCancelled(
                    b.getTutor().getId(), b.getStudent().getId(),
                    b.getSubject(), cancellerName, b.getId());

            return ApiResponse.success(toDto(b));
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @PatchMapping("/{id}/complete")
    public ApiResponse<Object> completeSession(@PathVariable Long id) {
        try {
            Booking b = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (b.getStatus() != Booking.BookingStatus.CONFIRMED)
                return ApiResponse.error("INVALID_STATUS", "Only CONFIRMED bookings can be marked as completed.");
            b.setStatus(Booking.BookingStatus.COMPLETED);
            bookingRepository.save(b);

            notificationService.notifySessionCompleted(
                    b.getStudent().getId(),
                    b.getTutor().getFirstName() + " " + b.getTutor().getLastName(),
                    b.getSubject(), b.getId());

            return ApiResponse.success(toDto(b));
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @PatchMapping("/{id}/no-show-student")
    public ApiResponse<Object> markStudentNoShow(@PathVariable Long id) {
        try {
            Booking b = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (b.getStatus() != Booking.BookingStatus.CONFIRMED)
                return ApiResponse.error("INVALID_STATUS", "Only CONFIRMED bookings can be marked as no-show.");
            b.setStatus(Booking.BookingStatus.NO_SHOW_STUDENT);
            bookingRepository.save(b);

            notificationService.notifySessionNoShowStudent(
                    b.getStudent().getId(),
                    b.getTutor().getFirstName() + " " + b.getTutor().getLastName(),
                    b.getSubject(), b.getId());

            return ApiResponse.success(toDto(b));
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    @PatchMapping("/{id}/no-show-tutor")
    public ApiResponse<Object> markTutorNoShow(@PathVariable Long id) {
        try {
            Booking b = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (b.getStatus() != Booking.BookingStatus.CONFIRMED)
                return ApiResponse.error("INVALID_STATUS", "Only CONFIRMED bookings can be marked as no-show.");
            b.setStatus(Booking.BookingStatus.NO_SHOW_TUTOR);
            bookingRepository.save(b);

            notificationService.notifySessionNoShowTutor(
                    b.getStudent().getId(),
                    b.getTutor().getFirstName() + " " + b.getTutor().getLastName(),
                    b.getSubject(), b.getId());

            return ApiResponse.success(toDto(b));
        } catch (Exception e) { return ApiResponse.error("BOOKING_ERROR", e.getMessage()); }
    }

    private void releaseSlot(Booking b) {
        if (b.getAvailabilitySlot() != null) {
            b.getAvailabilitySlot().setIsBooked(false);
            slotRepository.save(b.getAvailabilitySlot());
        }
    }

    private String currentEmail() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (p instanceof UserDetails ud) ? ud.getUsername() : p.toString();
    }
    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    private BookingDto toDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .studentId(b.getStudent().getId())
                .studentName(b.getStudent().getFirstName() + " " + b.getStudent().getLastName())
                .tutorId(b.getTutor().getId())
                .tutorName(b.getTutor().getFirstName() + " " + b.getTutor().getLastName())
                .subject(b.getSubject())
                .notes(b.getNotes())
                .status(b.getStatus().toString())
                .scheduledTime(b.getScheduledTime())
                .createdAt(b.getCreatedAt())
                .cancellationReason(b.getCancellationReason())
                .rejectionReason(b.getRejectionReason())
                .availabilitySlotId(b.getAvailabilitySlot() != null ? b.getAvailabilitySlot().getId() : null)
                .build();
    }
}

@Data class CreateBookingRequest {
    private Long tutorId; private String subject; private String notes;
    private String scheduledTime; private Long availabilitySlotId;
}
@Data class ReasonRequest { private String reason; }