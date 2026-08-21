package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.admin.AdminStatsDto;
import com.campus.lostandfound.dto.claim.ClaimResponseDto;
import com.campus.lostandfound.dto.common.ApiResponse;
import com.campus.lostandfound.dto.common.PageResponse;
import com.campus.lostandfound.dto.item.ItemResponseDto;
import com.campus.lostandfound.dto.match.MatchResponseDto;
import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getDashboardStats() {
        AdminStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Admin analytics retrieved successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<UserDto> users = adminService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> roleBody) {
        String roleStr = roleBody.get("role");
        if (roleStr == null) {
            throw new IllegalArgumentException("Role value is required");
        }
        User.Role role = User.Role.valueOf(roleStr.toUpperCase());
        UserDto updated = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success(updated, "User role updated successfully"));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse<UserDto>> approveUser(@PathVariable Long id) {
        UserDto approved = adminService.approveUser(id);
        return ResponseEntity.ok(ApiResponse.success(approved, "Student account approved successfully"));
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectUser(@PathVariable Long id) {
        adminService.rejectUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Registration rejected and removed"));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<PageResponse<ItemResponseDto>>> getAllItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<ItemResponseDto> items = adminService.getAllItems(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(items, "Items retrieved successfully"));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Void>> adminDeleteItem(@PathVariable Long id) {
        adminService.adminDeleteItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Item permanently deleted by admin"));
    }

    @GetMapping("/claims")
    public ResponseEntity<ApiResponse<PageResponse<ClaimResponseDto>>> getAllClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<ClaimResponseDto> claims = adminService.getAllClaims(page, size);
        return ResponseEntity.ok(ApiResponse.success(claims, "Claims retrieved successfully"));
    }

    @GetMapping("/matches")
    public ResponseEntity<ApiResponse<PageResponse<MatchResponseDto>>> getAllMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<MatchResponseDto> matches = adminService.getAllMatches(page, size);
        return ResponseEntity.ok(ApiResponse.success(matches, "Matches retrieved successfully"));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csvBytes = adminService.exportItemsCsv();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=bscoer_lost_and_found_audit.csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(csvBytes);
    }
}
