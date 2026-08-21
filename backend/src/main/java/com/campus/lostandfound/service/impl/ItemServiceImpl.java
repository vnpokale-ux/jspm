package com.campus.lostandfound.service.impl;

import com.campus.lostandfound.dto.common.PageResponse;
import com.campus.lostandfound.dto.item.ItemFilterDto;
import com.campus.lostandfound.dto.item.ItemRequestDto;
import com.campus.lostandfound.dto.item.ItemResponseDto;
import com.campus.lostandfound.dto.item.ItemSummaryDto;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.exception.UnauthorizedException;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.specification.ItemSpecification;
import com.campus.lostandfound.service.ItemService;
import com.campus.lostandfound.service.MatchingService;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserService userService;
    private final MatchingService matchingService;

    @Override
    @Transactional
    public ItemResponseDto createItem(ItemRequestDto request) {
        User currentUser = userService.getCurrentAuthenticatedUser();

        Item item = new Item();
        item.setType(request.getType());
        item.setTitle(request.getTitle().trim());
        item.setDescription(request.getDescription().trim());
        item.setCategory(request.getCategory().trim());
        item.setLocation(request.getLocation().trim());
        item.setItemDate(request.getItemDate() != null ? request.getItemDate() : LocalDateTime.now());
        item.setImageUrl(request.getImageUrl());
        item.setReporter(currentUser);
        item.setStatus(Item.ItemStatus.ACTIVE);
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        Item savedItem = itemRepository.save(item);
        log.info("New item created: ID={}, Type={}, Title={}", savedItem.getId(), savedItem.getType(), savedItem.getTitle());

        // Trigger intelligent matching engine
        try {
            matchingService.processItemForMatches(savedItem);
        } catch (Exception e) {
            log.error("Error running matching engine for item ID {}: {}", savedItem.getId(), e.getMessage());
        }

        return ItemResponseDto.fromEntity(savedItem);
    }

    @Override
    @Transactional
    public ItemResponseDto updateItem(Long id, ItemRequestDto request) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));

        verifyOwnershipOrAdmin(item, currentUser);

        item.setType(request.getType());
        item.setTitle(request.getTitle().trim());
        item.setDescription(request.getDescription().trim());
        item.setCategory(request.getCategory().trim());
        item.setLocation(request.getLocation().trim());
        if (request.getItemDate() != null) {
            item.setItemDate(request.getItemDate());
        }
        item.setImageUrl(request.getImageUrl());
        item.setUpdatedAt(LocalDateTime.now());

        Item updated = itemRepository.save(item);
        return ItemResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponseDto getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        return ItemResponseDto.fromEntity(item);
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));

        verifyOwnershipOrAdmin(item, currentUser);
        itemRepository.delete(item);
        log.info("Item ID {} deleted by User {}", id, currentUser.getId());
    }

    @Override
    @Transactional
    public ItemResponseDto updateItemStatus(Long id, Item.ItemStatus status) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));

        verifyOwnershipOrAdmin(item, currentUser);
        item.setStatus(status);
        item.setUpdatedAt(LocalDateTime.now());

        Item updated = itemRepository.save(item);
        return ItemResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ItemResponseDto> searchItems(ItemFilterDto filter) {
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = (filter.getSortBy() != null && !filter.getSortBy().isEmpty()) ? filter.getSortBy() : "createdAt";

        Pageable pageable = PageRequest.of(Math.max(0, filter.getPage()), Math.max(1, filter.getSize()), Sort.by(direction, sortBy));
        Page<Item> page = itemRepository.findAll(ItemSpecification.withFilters(filter), pageable);

        return PageResponse.from(page.map(ItemResponseDto::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ItemResponseDto> getMyItems(int page, int size, String sortBy, String sortDir) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "createdAt";

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, sortProperty));
        Page<Item> itemPage = itemRepository.findByReporter(currentUser, pageable);

        return PageResponse.from(itemPage.map(ItemResponseDto::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemSummaryDto> getRecentItems(int limit) {
        List<Item> items = itemRepository.findTop10ByStatusOrderByCreatedAtDesc(Item.ItemStatus.ACTIVE);
        return items.stream()
                .limit(limit > 0 ? limit : 10)
                .map(ItemSummaryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return itemRepository.findDistinctCategories();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllLocations() {
        return itemRepository.findDistinctLocations();
    }

    private void verifyOwnershipOrAdmin(Item item, User user) {
        if (user.getRole() == User.Role.ADMIN) {
            return;
        }
        if (item.getReporter() == null || !item.getReporter().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not have permission to modify this item");
        }
    }
}
