package com.campus.lostandfound.dto.claim;

import com.campus.lostandfound.model.Claim;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClaimStatusUpdateRequestDto {

    @NotNull(message = "Claim status (APPROVED or REJECTED) is required")
    private Claim.ClaimStatus status;
}
