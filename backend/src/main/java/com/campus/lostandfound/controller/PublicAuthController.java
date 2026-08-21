package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.common.ApiResponse;
import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/users")
@RequiredArgsConstructor
public class PublicAuthController {

    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> registerUser(@RequestBody UserDto request) {
        // Check if user already exists with this email
        Optional<User> existing = userRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            User user = existing.get();
            return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(user), "User account found and loaded"));
        }

        User newUser = new User();
        newUser.setClerkId(request.getClerkId() != null ? request.getClerkId() : "user_" + System.currentTimeMillis());
        newUser.setEmail(request.getEmail());
        newUser.setFirstName(request.getFirstName() != null ? request.getFirstName() : "Student");
        newUser.setLastName(request.getLastName() != null ? request.getLastName() : "");
        newUser.setPrn(request.getPrn());
        newUser.setDepartment(request.getDepartment());
        newUser.setRole(request.getRole() != null ? request.getRole() : User.Role.USER);
        
        // Admins are auto-approved; students require admin verification
        boolean isAdmin = newUser.getRole() == User.Role.ADMIN || request.getEmail().toLowerCase().contains("admin") || request.getEmail().toLowerCase().contains("faculty") || request.getEmail().toLowerCase().contains("kulkarni");
        newUser.setStatus(isAdmin ? User.UserStatus.APPROVED : User.UserStatus.PENDING);
        newUser.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(newUser);
        String msg = isAdmin ? "Admin account registered successfully." : "Registration submitted! Your account is pending verification by the Campus Security & Administration Desk.";
        return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(saved), msg));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto>> loginUser(@RequestBody UserDto request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getStatus() == User.UserStatus.PENDING) {
                return ResponseEntity.status(403).body(ApiResponse.error("Your account is pending approval by the College Administrator. Please contact Security Desk."));
            }
            return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(user), "Login successful"));
        }

        // If user doesn't exist yet, auto-register them
        return registerUser(request);
    }
}
