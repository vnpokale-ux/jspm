package com.campus.lostandfound.dto.claim;

import com.campus.lostandfound.dto.item.ItemSummaryDto;
import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.model.Claim;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponseDto {
    private Long id;
    private ItemSummaryDto item;
    private UserDto claimant;
    private String proofDescription;
    private Claim.ClaimStatus status;
    private String handoverToken;
    private Boolean isHandedOver;
    private LocalDateTime createdAt;

    public static ClaimResponseDto fromEntity(Claim claim) {
        if (claim == null) return null;
        return ClaimResponseDto.builder()
                .id(claim.getId())
                .item(ItemSummaryDto.fromEntity(claim.getItem()))
                .claimant(UserDto.fromEntity(claim.getClaimant()))
                .proofDescription(claim.getProofDescription())
                .status(claim.getStatus())
                .handoverToken(claim.getHandoverToken())
                .isHandedOver(claim.getIsHandedOver())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
