package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.common.ApiResponse;
import com.campus.lostandfound.dto.common.PageResponse;
import com.campus.lostandfound.dto.item.ItemFilterDto;
import com.campus.lostandfound.dto.item.ItemResponseDto;
import com.campus.lostandfound.dto.item.ItemSummaryDto;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicItemController {

    private final ItemService itemService;

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<PageResponse<ItemResponseDto>>> searchItems(
            @ModelAttribute ItemFilterDto filter) {
        // By default, public browsing shows only ACTIVE items unless otherwise specified
        if (filter.getStatus() == null) {
            filter.setStatus(Item.ItemStatus.ACTIVE);
        }
        PageResponse<ItemResponseDto> response = itemService.searchItems(filter);
        return ResponseEntity.ok(ApiResponse.success(response, "Items retrieved successfully"));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<ApiResponse<ItemResponseDto>> getItemById(@PathVariable Long id) {
        ItemResponseDto response = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Item retrieved successfully"));
    }

    @GetMapping("/items/recent")
    public ResponseEntity<ApiResponse<List<ItemSummaryDto>>> getRecentItems(
            @RequestParam(defaultValue = "8") int limit) {
        List<ItemSummaryDto> items = itemService.getRecentItems(limit);
        return ResponseEntity.ok(ApiResponse.success(items, "Recent items retrieved successfully"));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = itemService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories retrieved successfully"));
    }

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<String>>> getLocations() {
        List<String> locations = itemService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.success(locations, "Locations retrieved successfully"));
    }
}
