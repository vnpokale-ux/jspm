package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.match.MatchResponseDto;
import com.campus.lostandfound.model.Match;

import java.util.List;

public interface MatchService {
    List<MatchResponseDto> getMatchesForItem(Long itemId);
    List<MatchResponseDto> getMyMatches();
    MatchResponseDto updateMatchStatus(Long matchId, Match.MatchStatus status);
}
