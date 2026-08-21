package com.campus.lostandfound.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClaimRequestDto {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotBlank(message = "Proof description is required")
    @Size(min = 10, max = 2000, message = "Proof description must be between 10 and 2000 characters")
    private String proofDescription;
}
