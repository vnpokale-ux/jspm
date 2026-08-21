package com.campus.lostandfound.service;

import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.MatchRepository;
import com.campus.lostandfound.service.impl.MatchingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MatchingServiceImpl matchingService;

    private User user1;
    private User user2;
    private Item lostItem;
    private Item foundItem;

    @BeforeEach
    void setUp() {
        user1 = new User();
        user1.setId(1L);
        user1.setEmail("user1@bscoer.jspm.edu.in");

        user2 = new User();
        user2.setId(2L);
        user2.setEmail("user2@bscoer.jspm.edu.in");

        lostItem = new Item();
        lostItem.setId(101L);
        lostItem.setType(Item.ItemType.LOST);
        lostItem.setTitle("Apple AirPods Pro in Black Silicone Case");
        lostItem.setDescription("Lost my AirPods Pro near reading desk on library 3rd floor.");
        lostItem.setCategory("Electronics & Gadgets");
        lostItem.setLocation("BSCOER Central Library & Digital Reading Hall (3rd Floor)");
        lostItem.setItemDate(LocalDateTime.now().minusHours(2));
        lostItem.setStatus(Item.ItemStatus.ACTIVE);
        lostItem.setReporter(user1);

        foundItem = new Item();
        foundItem.setId(102L);
        foundItem.setType(Item.ItemType.FOUND);
        foundItem.setTitle("AirPods Pro with Black Protective Cover");
        foundItem.setDescription("Found Apple AirPods on study desk on library 3rd floor.");
        foundItem.setCategory("Electronics & Gadgets");
        foundItem.setLocation("BSCOER Central Library & Digital Reading Hall (3rd Floor)");
        foundItem.setItemDate(LocalDateTime.now().minusHours(1));
        foundItem.setStatus(Item.ItemStatus.ACTIVE);
        foundItem.setReporter(user2);
    }

    @Test
    @DisplayName("Should compute high similarity score (> 0.70) for identical category, location, and keywords")
    void testCalculateMatchScore_HighMatch() {
        double score = matchingService.calculateMatchScore(lostItem, foundItem);
        assertTrue(score >= 0.70, "Score should be >= 70% for strongly matching items, was: " + score);
    }

    @Test
    @DisplayName("Should compute low similarity score for completely different categories and items")
    void testCalculateMatchScore_LowMatch() {
        Item differentItem = new Item();
        differentItem.setId(103L);
        differentItem.setType(Item.ItemType.FOUND);
        differentItem.setTitle("Royal Enfield Bike Key");
        differentItem.setDescription("Found brass key near campus lawn");
        differentItem.setCategory("Bike/Car Keys & Fobs");
        differentItem.setLocation("JSPM Main Campus Amphitheatre");
        differentItem.setItemDate(LocalDateTime.now().minusDays(20));

        double score = matchingService.calculateMatchScore(lostItem, differentItem);
        assertTrue(score < 0.40, "Score should be < 40% for non-matching items, was: " + score);
    }

    @Test
    @DisplayName("Should create Match and trigger notifications when candidate item is processed")
    void testProcessItemForMatches_CreatesMatchAndNotifies() {
        when(itemRepository.findByTypeAndStatus(Item.ItemType.FOUND, Item.ItemStatus.ACTIVE))
                .thenReturn(List.of(foundItem));
        when(matchRepository.existsByLostItemAndFoundItem(lostItem, foundItem))
                .thenReturn(false);
        when(matchRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        matchingService.processItemForMatches(lostItem);

        verify(matchRepository, times(1)).save(any());
        verify(notificationService, times(2)).createNotification(any(), any(), any(), any(), any());
    }
}
