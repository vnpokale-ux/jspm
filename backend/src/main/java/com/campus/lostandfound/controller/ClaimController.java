package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.claim.ClaimRequestDto;
import com.campus.lostandfound.dto.claim.ClaimResponseDto;
import com.campus.lostandfound.dto.claim.ClaimStatusUpdateRequestDto;
import com.campus.lostandfound.dto.common.ApiResponse;
import com.campus.lostandfound.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimResponseDto>> createClaim(
            @Valid @RequestBody ClaimRequestDto request) {
        ClaimResponseDto created = claimService.createClaim(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Claim submitted successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ClaimResponseDto>>> getMyClaims() {
        List<ClaimResponseDto> claims = claimService.getMyClaims();
        return ResponseEntity.ok(ApiResponse.success(claims, "User claims retrieved successfully"));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<ClaimResponseDto>>> getClaimsReceivedOnMyItems() {
        List<ClaimResponseDto> claims = claimService.getClaimsReceivedOnMyItems();
        return ResponseEntity.ok(ApiResponse.success(claims, "Received claims retrieved successfully"));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<ApiResponse<List<ClaimResponseDto>>> getClaimsByItemId(
            @PathVariable Long itemId) {
        List<ClaimResponseDto> claims = claimService.getClaimsByItemId(itemId);
        return ResponseEntity.ok(ApiResponse.success(claims, "Item claims retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ClaimResponseDto>> updateClaimStatus(
            @PathVariable Long id,
            @Valid @RequestBody ClaimStatusUpdateRequestDto request) {
        ClaimResponseDto updated = claimService.updateClaimStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(updated, "Claim status updated to " + request.getStatus()));
    }

    @PostMapping("/{id}/verify-handover")
    public ResponseEntity<ApiResponse<ClaimResponseDto>> verifyHandover(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Handover token is required");
        }
        ClaimResponseDto updated = claimService.verifyHandover(id, token);
        return ResponseEntity.ok(ApiResponse.success(updated, "Physical handover verified successfully"));
    }
}
