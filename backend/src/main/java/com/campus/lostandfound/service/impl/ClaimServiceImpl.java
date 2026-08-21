package com.campus.lostandfound.service.impl;

import com.campus.lostandfound.dto.claim.ClaimRequestDto;
import com.campus.lostandfound.dto.claim.ClaimResponseDto;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.exception.UnauthorizedException;
import com.campus.lostandfound.model.Claim;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.Notification;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.ClaimRepository;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.service.ClaimService;
import com.campus.lostandfound.service.NotificationService;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    @Transactional
    public ClaimResponseDto createClaim(ClaimRequestDto request) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", request.getItemId()));

        if (item.getStatus() != Item.ItemStatus.ACTIVE) {
            throw new BadRequestException("Claims can only be filed on active items");
        }

        if (item.getReporter() != null && item.getReporter().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot file a claim on an item you reported yourself");
        }

        if (claimRepository.existsByItemAndClaimant(item, currentUser)) {
            throw new BadRequestException("You have already filed a claim on this item");
        }

        Claim claim = new Claim();
        claim.setItem(item);
        claim.setClaimant(currentUser);
        claim.setProofDescription(request.getProofDescription().trim());
        claim.setStatus(Claim.ClaimStatus.PENDING);
        claim.setIsHandedOver(false);
        claim.setCreatedAt(LocalDateTime.now());

        Claim savedClaim = claimRepository.save(claim);
        log.info("New claim #{} filed on Item #{} by User #{}", savedClaim.getId(), item.getId(), currentUser.getId());

        // Notify finder
        if (item.getReporter() != null) {
            notificationService.createNotification(
                    item.getReporter(),
                    "🛡️ New Claim Filed on '" + item.getTitle() + "'",
                    currentUser.getFirstName() + " filed an ownership claim. Please review their proof description.",
                    Notification.NotificationType.CLAIM_FILED,
                    savedClaim.getId()
            );
        }

        return ClaimResponseDto.fromEntity(savedClaim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponseDto> getMyClaims() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        List<Claim> claims = claimRepository.findByClaimantOrderByCreatedAtDesc(currentUser);
        return claims.stream().map(ClaimResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponseDto> getClaimsReceivedOnMyItems() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        List<Claim> claims = claimRepository.findByItemReporter(currentUser);
        return claims.stream().map(ClaimResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponseDto> getClaimsByItemId(Long itemId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));

        if (currentUser.getRole() != User.Role.ADMIN &&
                (item.getReporter() == null || !item.getReporter().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You do not have permission to view claims for this item");
        }

        List<Claim> claims = claimRepository.findByItemIdOrderByCreatedAtDesc(itemId);
        return claims.stream().map(ClaimResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClaimResponseDto updateClaimStatus(Long claimId, Claim.ClaimStatus newStatus) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));

        Item item = claim.getItem();

        if (currentUser.getRole() != User.Role.ADMIN &&
                (item.getReporter() == null || !item.getReporter().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("You do not have permission to update the status of this claim");
        }

        claim.setStatus(newStatus);

        if (newStatus == Claim.ClaimStatus.APPROVED) {
            // Generate secure 6-digit handover PIN token
            String token = "TK-" + (100000 + RANDOM.nextInt(900000));
            claim.setHandoverToken(token);

            item.setStatus(Item.ItemStatus.RESOLVED);
            item.setUpdatedAt(LocalDateTime.now());
            itemRepository.save(item);

            // Notify claimant of approval and provide Handover Token
            notificationService.createNotification(
                    claim.getClaimant(),
                    "🎉 Ownership Claim Approved!",
                    "Your claim on '" + item.getTitle() + "' was APPROVED. Present Handover Code: " + token + " to collect.",
                    Notification.NotificationType.CLAIM_APPROVED,
                    claim.getId()
            );
        } else if (newStatus == Claim.ClaimStatus.REJECTED) {
            notificationService.createNotification(
                    claim.getClaimant(),
                    "❌ Claim Status Update",
                    "Your claim on '" + item.getTitle() + "' was not approved. Check details or contact the reporter.",
                    Notification.NotificationType.CLAIM_REJECTED,
                    claim.getId()
            );
        }

        Claim updatedClaim = claimRepository.save(claim);
        return ClaimResponseDto.fromEntity(updatedClaim);
    }

    @Override
    @Transactional
    public ClaimResponseDto verifyHandover(Long claimId, String token) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));

        Item item = claim.getItem();

        if (currentUser.getRole() != User.Role.ADMIN &&
                (item.getReporter() == null || !item.getReporter().getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("Only the finder or admin can verify physical handover");
        }

        if (claim.getHandoverToken() == null || !claim.getHandoverToken().equalsIgnoreCase(token.trim())) {
            throw new BadRequestException("Invalid handover token. Please check and retry.");
        }

        claim.setIsHandedOver(true);
        item.setStatus(Item.ItemStatus.CLOSED);
        item.setUpdatedAt(LocalDateTime.now());
        itemRepository.save(item);

        Claim updatedClaim = claimRepository.save(claim);
        log.info("Physical handover verified for Claim #{} using token {}", claimId, token);

        notificationService.createNotification(
                claim.getClaimant(),
                "✅ Handover Completed",
                "Your item '" + item.getTitle() + "' was successfully handed over and closed.",
                Notification.NotificationType.ITEM_RESOLVED,
                claim.getId()
        );

        return ClaimResponseDto.fromEntity(updatedClaim);
    }
}
