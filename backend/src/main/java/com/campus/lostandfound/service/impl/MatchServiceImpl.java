package com.campus.lostandfound.service.impl;

import com.campus.lostandfound.dto.match.MatchResponseDto;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.exception.UnauthorizedException;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.Match;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.MatchRepository;
import com.campus.lostandfound.service.MatchService;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final ItemRepository itemRepository;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponseDto> getMatchesForItem(Long itemId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));

        // Allow reporter or admin
        if (currentUser.getRole() != User.Role.ADMIN &&
                (item.getReporter() == null || !item.getReporter().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You do not have permission to view matches for this item");
        }

        List<Match> matches = matchRepository.findAllByItemId(itemId);
        return matches.stream().map(MatchResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponseDto> getMyMatches() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        List<Match> matches = matchRepository.findAllByUserItems(currentUser);
        return matches.stream().map(MatchResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MatchResponseDto updateMatchStatus(Long matchId, Match.MatchStatus status) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", "id", matchId));

        boolean isReporter = (match.getLostItem() != null && match.getLostItem().getReporter() != null && match.getLostItem().getReporter().getId().equals(currentUser.getId()))
                || (match.getFoundItem() != null && match.getFoundItem().getReporter() != null && match.getFoundItem().getReporter().getId().equals(currentUser.getId()));

        if (currentUser.getRole() != User.Role.ADMIN && !isReporter) {
            throw new UnauthorizedException("You do not have permission to update this match");
        }

        match.setStatus(status);
        Match updated = matchRepository.save(match);
        log.info("Match #{} status updated to {} by user #{}", matchId, status, currentUser.getId());

        return MatchResponseDto.fromEntity(updated);
    }
}
