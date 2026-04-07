package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users/me
    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    // PUT /api/users/me — update own profile
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        try {
            User updated = userService.updateProfile(user.getId(), body);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/users — admin only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // POST /api/users — admin creates user
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        try {
            String name     = body.get("name");
            String email    = body.get("email");
            String password = body.get("password");
            String role     = body.get("role");

            if (name == null || email == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Name, email and password are required"));
            }

            User created = userService.createUser(name, email, password, role);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/users/{id} — admin edits any user
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        try {
            User updated = userService.updateProfile(id, body);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/users/{id}/role — admin changes role
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        try {
            String role = body.get("role");
            User updated = userService.updateRole(id, role);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/users/{id} — admin deletes user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        try {
            if (id.equals(currentUser.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "You cannot delete your own account"));
            }
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}