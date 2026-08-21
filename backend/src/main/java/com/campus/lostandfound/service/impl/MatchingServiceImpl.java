package com.campus.lostandfound.service.impl;

import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.Match;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.MatchRepository;
import com.campus.lostandfound.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingServiceImpl implements MatchingService {

    private final MatchRepository matchRepository;
    private final ItemRepository itemRepository;
    private final com.campus.lostandfound.service.NotificationService notificationService;

    private static final double MATCH_THRESHOLD = 0.45; // 45% similarity threshold to suggest a match

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "is", "was", "are", "were", "it", "this",
            "that", "my", "lost", "found", "near", "around", "please", "help"
    );

    @Override
    @Transactional
    public void processItemForMatches(Item item) {
        if (item == null || item.getStatus() != Item.ItemStatus.ACTIVE) {
            return;
        }

        Item.ItemType oppositeType = (item.getType() == Item.ItemType.LOST)
                ? Item.ItemType.FOUND
                : Item.ItemType.LOST;

        List<Item> candidates = itemRepository.findByTypeAndStatus(oppositeType, Item.ItemStatus.ACTIVE);

        log.info("Running matching engine for item ID {}: found {} candidate items of type {}",
                item.getId(), candidates.size(), oppositeType);

        for (Item candidate : candidates) {
            // Avoid matching items from the exact same user if reporter is the same
            if (item.getReporter() != null && candidate.getReporter() != null
                    && item.getReporter().getId().equals(candidate.getReporter().getId())) {
                continue;
            }

            Item lostItem = (item.getType() == Item.ItemType.LOST) ? item : candidate;
            Item foundItem = (item.getType() == Item.ItemType.FOUND) ? item : candidate;

            if (matchRepository.existsByLostItemAndFoundItem(lostItem, foundItem)) {
                continue;
            }

            double score = calculateMatchScore(lostItem, foundItem);

            if (score >= MATCH_THRESHOLD) {
                Match match = new Match();
                match.setLostItem(lostItem);
                match.setFoundItem(foundItem);
                match.setMatchScore(Math.round(score * 100.0) / 100.0);
                match.setStatus(Match.MatchStatus.SUGGESTED);

                Match savedMatch = matchRepository.save(match);
                log.info("Created match between Lost Item #{} and Found Item #{} with score {}",
                        lostItem.getId(), foundItem.getId(), match.getMatchScore());

                // Trigger alerts for both reporters
                int scorePct = (int) Math.round(match.getMatchScore() * 100);
                if (lostItem.getReporter() != null) {
                    notificationService.createNotification(
                            lostItem.getReporter(),
                            "✨ Possible Match Found (" + scorePct + "% Match)",
                            "A found item matching your lost '" + lostItem.getTitle() + "' was reported: '" + foundItem.getTitle() + "'.",
                            com.campus.lostandfound.model.Notification.NotificationType.MATCH_FOUND,
                            savedMatch.getId()
                    );
                }
                if (foundItem.getReporter() != null) {
                    notificationService.createNotification(
                            foundItem.getReporter(),
                            "✨ Match Suggestion Available (" + scorePct + "%)",
                            "Your found item '" + foundItem.getTitle() + "' matched a reported lost item.",
                            com.campus.lostandfound.model.Notification.NotificationType.MATCH_FOUND,
                            savedMatch.getId()
                    );
                }
            }
        }
    }

    @Override
    public double calculateMatchScore(Item lostItem, Item foundItem) {
        if (lostItem == null || foundItem == null) {
            return 0.0;
        }

        double categoryScore = calculateCategoryScore(lostItem.getCategory(), foundItem.getCategory());
        double textScore = calculateTextScore(lostItem, foundItem);
        double locationScore = calculateLocationScore(lostItem.getLocation(), foundItem.getLocation());
        double dateScore = calculateDateScore(lostItem.getItemDate(), foundItem.getItemDate());

        // Weights: Category (40%), Text (35%), Location (15%), Date (10%)
        double totalScore = (categoryScore * 0.40)
                + (textScore * 0.35)
                + (locationScore * 0.15)
                + (dateScore * 0.10);

        return Math.min(1.0, Math.max(0.0, totalScore));
    }

    private double calculateCategoryScore(String cat1, String cat2) {
        if (cat1 == null || cat2 == null) return 0.2;
        String c1 = cat1.trim().toLowerCase();
        String c2 = cat2.trim().toLowerCase();
        if (c1.equals(c2)) return 1.0;
        if (c1.contains(c2) || c2.contains(c1)) return 0.7;
        return 0.0;
    }

    private double calculateTextScore(Item item1, Item item2) {
        Set<String> tokens1 = extractKeywords((item1.getTitle() + " " + item1.getDescription()).toLowerCase());
        Set<String> tokens2 = extractKeywords((item2.getTitle() + " " + item2.getDescription()).toLowerCase());

        if (tokens1.isEmpty() || tokens2.isEmpty()) {
            return 0.1;
        }

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        double jaccard = (double) intersection.size() / (double) union.size();

        // Extra weight if titles have strong overlap
        Set<String> titleTokens1 = extractKeywords(item1.getTitle().toLowerCase());
        Set<String> titleTokens2 = extractKeywords(item2.getTitle().toLowerCase());
        Set<String> titleIntersection = new HashSet<>(titleTokens1);
        titleIntersection.retainAll(titleTokens2);

        double titleBonus = (!titleTokens1.isEmpty() && !titleTokens2.isEmpty())
                ? (double) titleIntersection.size() / Math.min(titleTokens1.size(), titleTokens2.size())
                : 0.0;

        return Math.min(1.0, (jaccard * 0.6) + (titleBonus * 0.4));
    }

    private double calculateLocationScore(String loc1, String loc2) {
        if (loc1 == null || loc2 == null || loc1.trim().isEmpty() || loc2.trim().isEmpty()) {
            return 0.3;
        }
        String l1 = loc1.trim().toLowerCase();
        String l2 = loc2.trim().toLowerCase();
        if (l1.equals(l2)) return 1.0;
        if (l1.contains(l2) || l2.contains(l1)) return 0.8;

        Set<String> words1 = extractKeywords(l1);
        Set<String> words2 = extractKeywords(l2);
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        if (!intersection.isEmpty()) {
            return 0.6;
        }
        return 0.0;
    }

    private double calculateDateScore(LocalDateTime date1, LocalDateTime date2) {
        if (date1 == null || date2 == null) {
            return 0.5;
        }

        long daysDiff = Math.abs(Duration.between(date1, date2).toDays());

        if (daysDiff <= 1) return 1.0;
        if (daysDiff <= 3) return 0.85;
        if (daysDiff <= 7) return 0.65;
        if (daysDiff <= 14) return 0.4;
        if (daysDiff <= 30) return 0.2;
        return 0.05;
    }

    private Set<String> extractKeywords(String text) {
        if (text == null) return Collections.emptySet();
        return Arrays.stream(text.split("[^a-zA-Z0-9]+"))
                .map(String::trim)
                .filter(w -> w.length() > 2)
                .filter(w -> !STOP_WORDS.contains(w))
                .collect(Collectors.toSet());
    }
}
