package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.common.ApiResponse;
import com.campus.lostandfound.dto.match.MatchResponseDto;
import com.campus.lostandfound.dto.match.MatchStatusUpdateRequestDto;
import com.campus.lostandfound.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<MatchResponseDto>>> getMyMatches() {
        List<MatchResponseDto> matches = matchService.getMyMatches();
        return ResponseEntity.ok(ApiResponse.success(matches, "Suggested matches retrieved successfully"));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<ApiResponse<List<MatchResponseDto>>> getMatchesForItem(
            @PathVariable Long itemId) {
        List<MatchResponseDto> matches = matchService.getMatchesForItem(itemId);
        return ResponseEntity.ok(ApiResponse.success(matches, "Item matches retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MatchResponseDto>> updateMatchStatus(
            @PathVariable Long id,
            @Valid @RequestBody MatchStatusUpdateRequestDto request) {
        MatchResponseDto updated = matchService.updateMatchStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(updated, "Match status updated to " + request.getStatus()));
    }
}
