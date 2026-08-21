package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.claim.ClaimRequestDto;
import com.campus.lostandfound.dto.claim.ClaimResponseDto;
import com.campus.lostandfound.model.Claim;

import java.util.List;

public interface ClaimService {
    ClaimResponseDto createClaim(ClaimRequestDto request);
    List<ClaimResponseDto> getMyClaims();
    List<ClaimResponseDto> getClaimsReceivedOnMyItems();
    List<ClaimResponseDto> getClaimsByItemId(Long itemId);
    ClaimResponseDto updateClaimStatus(Long claimId, Claim.ClaimStatus newStatus);
    ClaimResponseDto verifyHandover(Long claimId, String token);
}
