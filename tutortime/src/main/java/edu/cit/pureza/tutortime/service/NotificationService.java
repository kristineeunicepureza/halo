package edu.cit.pureza.tutortime.service;

import edu.cit.pureza.tutortime.entity.Notification;
import edu.cit.pureza.tutortime.entity.Notification.NotificationType;
import edu.cit.pureza.tutortime.repository.NotificationRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;

    // ── public push helpers ───────────────────────────────────────────────

    /** Booking created → notify tutor */
    public void notifyBookingCreated(Long tutorId, String studentName, String subject, Long bookingId) {
        push(tutorId,
             "New Booking Request",
             studentName + " has booked a session for " + subject + ".",
             NotificationType.BOOKING_CREATED, bookingId);
    }

    /** Booking confirmed → notify student */
    public void notifyBookingConfirmed(Long studentId, String tutorName, String subject, Long bookingId) {
        push(studentId,
             "Booking Confirmed",
             "Your " + subject + " session with " + tutorName + " has been confirmed.",
             NotificationType.BOOKING_CONFIRMED, bookingId);
    }

    /** Booking cancelled → notify both tutor and student */
    public void notifyBookingCancelled(Long tutorId, Long studentId,
                                       String subject, String cancelledByName, Long bookingId) {
        push(tutorId,
             "Booking Cancelled",
             cancelledByName + "'s " + subject + " session has been cancelled.",
             NotificationType.BOOKING_CANCELLED, bookingId);
        push(studentId,
             "Booking Cancelled",
             "Your " + subject + " session has been cancelled.",
             NotificationType.BOOKING_CANCELLED, bookingId);
    }

    /** Booking rejected → notify student */
    public void notifyBookingRejected(Long studentId, String tutorName, String subject, Long bookingId) {
        push(studentId,
             "Booking Rejected",
             "Your " + subject + " session request with " + tutorName + " was declined.",
             NotificationType.BOOKING_REJECTED, bookingId);
    }

    /** New tutor registered → notify all admins */
    public void notifyTutorRegistered(String tutorFullName) {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.ADMIN)
                .forEach(admin -> push(admin.getId(),
                        "New Tutor Registration",
                        tutorFullName + " has registered as a tutor and is awaiting approval.",
                        NotificationType.TUTOR_REGISTERED, null));
    }

    /** Tutor approved → notify the tutor */
    public void notifyTutorApproved(Long tutorId, String tutorFirstName) {
        push(tutorId,
             "Account Approved 🎉",
             "Congratulations " + tutorFirstName + "! Your tutor account has been approved. You can now access your dashboard.",
             NotificationType.TUTOR_APPROVED, null);
    }

    // ── read / count ──────────────────────────────────────────────────────

    public List<Notification> getForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    public void markOneRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    // ── private ───────────────────────────────────────────────────────────

    private void push(Long recipientId, String title, String message,
                      NotificationType type, Long referenceId) {
        notificationRepository.save(
                Notification.builder()
                        .recipientId(recipientId)
                        .title(title)
                        .message(message)
                        .type(type)
                        .referenceId(referenceId)
                        .build());
    }
} ginmurin <johnemmanuel.sevilla@cit.edu>.