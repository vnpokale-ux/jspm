package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.common.ApiResponse;
import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.dto.user.UserUpdateRequestDto;
import com.campus.lostandfound.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUserProfile() {
        UserDto profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(profile, "User profile retrieved successfully"));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUserProfile(
            @Valid @RequestBody UserUpdateRequestDto request) {
        UserDto updated = userService.updateCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success(updated, "User profile updated successfully"));
    }
}
