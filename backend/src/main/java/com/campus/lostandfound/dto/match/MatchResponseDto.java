package com.campus.lostandfound.dto.match;

import com.campus.lostandfound.dto.item.ItemSummaryDto;
import com.campus.lostandfound.model.Match;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseDto {
    private Long id;
    private ItemSummaryDto lostItem;
    private ItemSummaryDto foundItem;
    private Double matchScore;
    private Match.MatchStatus status;
    private LocalDateTime createdAt;

    public static MatchResponseDto fromEntity(Match match) {
        if (match == null) return null;
        return MatchResponseDto.builder()
                .id(match.getId())
                .lostItem(ItemSummaryDto.fromEntity(match.getLostItem()))
                .foundItem(ItemSummaryDto.fromEntity(match.getFoundItem()))
                .matchScore(match.getMatchScore())
                .status(match.getStatus())
                .createdAt(match.getCreatedAt())
                .build();
    }
}
