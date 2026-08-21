package com.campus.lostandfound.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalUsers;
    private long totalItems;
    private long activeLostItems;
    private long activeFoundItems;
    private long resolvedItems;
    private long closedItems;
    private long totalClaims;
    private long pendingClaims;
    private long approvedClaims;
    private long totalMatches;
    private long confirmedMatches;
    private Map<String, Long> itemsByCategory;
    private Map<String, Long> itemsByLocation;
}
