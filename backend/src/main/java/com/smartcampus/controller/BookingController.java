package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Helper — check if the logged-in user is admin
    private boolean isAdmin(User user) {
        return user != null &&
               user.getRole() != null &&
               user.getRole().name().equalsIgnoreCase("ADMIN");
    }

    // GET /api/bookings — user sees own, admin sees all
    @GetMapping
    public ResponseEntity<?> getMyBookings(
            @AuthenticationPrincipal User user) {
        try {
            List<Booking> bookings = isAdmin(user)
                ? bookingService.getAllBookings()
                : bookingService.getMyBookings(user.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/bookings/all — admin only
    @GetMapping("/all")
    public ResponseEntity<?> getAllBookings(
            @AuthenticationPrincipal User user) {
        if (!isAdmin(user)) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Admin access required"));
        }
        try {
            return ResponseEntity.ok(bookingService.getAllBookings());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/bookings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        try {
            Booking booking = bookingService.getBookingById(id);

            boolean owner = booking.getUserId().equals(user.getId());

            if (!isAdmin(user) && !owner) {
                return ResponseEntity.status(403)
                    .body(Map.of("error", "Access denied"));
            }

            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/bookings/resource/{resourceId}
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<?> getBookingsByResource(
            @PathVariable String resourceId) {
        try {
            return ResponseEntity.ok(
                bookingService.getBookingsByResource(resourceId)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/bookings — any logged-in user including admin
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        try {
            Booking created = bookingService.createBooking(body, user);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    // PATCH /api/bookings/{id}/status — admin only
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {

        // Manual admin check — no @PreAuthorize needed
        if (!isAdmin(user)) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Admin access required"));
        }

        try {
            String status    = body.get("status");
            String adminNote = body.getOrDefault("adminNote", "");

            if (status == null || status.isBlank()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status is required"));
            }

            Booking updated = bookingService.updateStatus(
                id, status, adminNote, user
            );
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/bookings/{id} — owner or admin
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        try {
            bookingService.deleteBooking(id, user);
            return ResponseEntity.ok(
                Map.of("message", "Booking cancelled successfully")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}