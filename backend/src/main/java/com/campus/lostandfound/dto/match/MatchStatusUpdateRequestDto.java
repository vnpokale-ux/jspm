package com.campus.lostandfound.dto.match;

import com.campus.lostandfound.model.Match;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MatchStatusUpdateRequestDto {

    @NotNull(message = "Match status (CONFIRMED or REJECTED) is required")
    private Match.MatchStatus status;
}
