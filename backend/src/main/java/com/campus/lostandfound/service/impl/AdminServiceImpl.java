package com.campus.lostandfound.service.impl;

import com.campus.lostandfound.dto.admin.AdminStatsDto;
import com.campus.lostandfound.dto.claim.ClaimResponseDto;
import com.campus.lostandfound.dto.common.PageResponse;
import com.campus.lostandfound.dto.item.ItemResponseDto;
import com.campus.lostandfound.dto.match.MatchResponseDto;
import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.exception.UnauthorizedException;
import com.campus.lostandfound.model.Claim;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.Match;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.ClaimRepository;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.MatchRepository;
import com.campus.lostandfound.repository.UserRepository;
import com.campus.lostandfound.service.AdminService;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final MatchRepository matchRepository;
    private final UserService userService;

    private void verifyAdmin() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Administrative privileges required");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsDto getDashboardStats() {
        verifyAdmin();

        long totalUsers = userRepository.count();
        long totalItems = itemRepository.count();
        long activeLostItems = itemRepository.countByTypeAndStatus(Item.ItemType.LOST, Item.ItemStatus.ACTIVE);
        long activeFoundItems = itemRepository.countByTypeAndStatus(Item.ItemType.FOUND, Item.ItemStatus.ACTIVE);
        long resolvedItems = itemRepository.countByStatus(Item.ItemStatus.RESOLVED);
        long closedItems = itemRepository.countByStatus(Item.ItemStatus.CLOSED);

        long totalClaims = claimRepository.count();
        long pendingClaims = claimRepository.countByStatus(Claim.ClaimStatus.PENDING);
        long approvedClaims = claimRepository.countByStatus(Claim.ClaimStatus.APPROVED);

        long totalMatches = matchRepository.count();
        long confirmedMatches = matchRepository.countByStatus(Match.MatchStatus.CONFIRMED);

        Map<String, Long> categoryCounts = new HashMap<>();
        List<Object[]> catRows = itemRepository.countItemsGroupedByCategory();
        for (Object[] row : catRows) {
            if (row[0] != null) {
                categoryCounts.put((String) row[0], ((Number) row[1]).longValue());
            }
        }

        Map<String, Long> locationCounts = new HashMap<>();
        List<Object[]> locRows = itemRepository.countItemsGroupedByLocation();
        for (Object[] row : locRows) {
            if (row[0] != null) {
                locationCounts.put((String) row[0], ((Number) row[1]).longValue());
            }
        }

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalItems(totalItems)
                .activeLostItems(activeLostItems)
                .activeFoundItems(activeFoundItems)
                .resolvedItems(resolvedItems)
                .closedItems(closedItems)
                .totalClaims(totalClaims)
                .pendingClaims(pendingClaims)
                .approvedClaims(approvedClaims)
                .totalMatches(totalMatches)
                .confirmedMatches(confirmedMatches)
                .itemsByCategory(categoryCounts)
                .itemsByLocation(locationCounts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserDto> getAllUsers(int page, int size) {
        verifyAdmin();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users = userRepository.findAll(pageable);
        return PageResponse.from(users.map(UserDto::fromEntity));
    }

    @Override
    @Transactional
    public UserDto updateUserRole(Long userId, User.Role role) {
        verifyAdmin();
        if (role == null) {
            throw new BadRequestException("Role cannot be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setRole(role);
        User saved = userRepository.save(user);
        log.info("Admin updated User #{} role to {}", userId, role);

        return UserDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public UserDto approveUser(Long userId) {
        verifyAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setStatus(User.UserStatus.APPROVED);
        User saved = userRepository.save(user);
        log.info("Admin approved student account: User #{} ({})", userId, user.getEmail());

        return UserDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void rejectUser(Long userId) {
        verifyAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        userRepository.delete(user);
        log.info("Admin rejected and deleted student account: User #{} ({})", userId, user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ItemResponseDto> getAllItems(int page, int size, String sortBy, String sortDir) {
        verifyAdmin();
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "createdAt";

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, sortProperty));
        Page<Item> items = itemRepository.findAll(pageable);

        return PageResponse.from(items.map(ItemResponseDto::fromEntity));
    }

    @Override
    @Transactional
    public void adminDeleteItem(Long itemId) {
        verifyAdmin();
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));

        itemRepository.delete(item);
        log.info("Admin deleted Item #{}", itemId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ClaimResponseDto> getAllClaims(int page, int size) {
        verifyAdmin();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Claim> claims = claimRepository.findAll(pageable);
        return PageResponse.from(claims.map(ClaimResponseDto::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MatchResponseDto> getAllMatches(int page, int size) {
        verifyAdmin();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Match> matches = matchRepository.findAll(pageable);
        return PageResponse.from(matches.map(MatchResponseDto::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportItemsCsv() {
        verifyAdmin();
        List<Item> items = itemRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Type,Title,Category,Location,Status,Reporter,Reporter Email,Date Reported,Created At\n");

        for (Item item : items) {
            sb.append(item.getId()).append(",")
              .append(item.getType()).append(",")
              .append("\"").append(escapeCsv(item.getTitle())).append("\",")
              .append("\"").append(escapeCsv(item.getCategory())).append("\",")
              .append("\"").append(escapeCsv(item.getLocation())).append("\",")
              .append(item.getStatus()).append(",")
              .append("\"").append(item.getReporter() != null ? escapeCsv(item.getReporter().getFirstName() + " " + item.getReporter().getLastName()) : "N/A").append("\",")
              .append("\"").append(item.getReporter() != null ? escapeCsv(item.getReporter().getEmail()) : "N/A").append("\",")
              .append(item.getItemDate() != null ? item.getItemDate().toString() : "N/A").append(",")
              .append(item.getCreatedAt() != null ? item.getCreatedAt().toString() : "N/A").append("\n");
        }

        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }
}
