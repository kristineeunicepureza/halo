package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.entity.Notification;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "${cors.allowed-origins}")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository      userRepository;

    @GetMapping("/my")
    public ApiResponse<List<Notification>> getMyNotifications() {
        Long uid = resolveUserId();
        return ApiResponse.success(notificationService.getForUser(uid));
    }

    @GetMapping("/my/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount() {
        Long uid = resolveUserId();
        return ApiResponse.success(Map.of("count", notificationService.getUnreadCount(uid)));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<String> markOneRead(@PathVariable Long id) {
        notificationService.markOneRead(id);
        return ApiResponse.success("Marked as read.");
    }

    @PatchMapping("/read-all")
    public ApiResponse<String> markAllRead() {
        notificationService.markAllRead(resolveUserId());
        return ApiResponse.success("All marked as read.");
    }

    private Long resolveUserId() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = (p instanceof UserDetails ud) ? ud.getUsername() : p.toString();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }
}