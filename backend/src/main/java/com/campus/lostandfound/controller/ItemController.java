package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.common.ApiResponse;
import com.campus.lostandfound.dto.common.PageResponse;
import com.campus.lostandfound.dto.item.ItemRequestDto;
import com.campus.lostandfound.dto.item.ItemResponseDto;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponseDto>> createItem(@Valid @RequestBody ItemRequestDto request) {
        ItemResponseDto created = itemService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Item report submitted successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<ItemResponseDto>>> getMyItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<ItemResponseDto> response = itemService.getMyItems(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response, "User items retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponseDto>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequestDto request) {
        ItemResponseDto updated = itemService.updateItem(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Item updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Item deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ItemResponseDto>> updateItemStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody) {
        String statusStr = statusBody.get("status");
        if (statusStr == null) {
            throw new IllegalArgumentException("Status value is required");
        }
        Item.ItemStatus status = Item.ItemStatus.valueOf(statusStr.toUpperCase());
        ItemResponseDto updated = itemService.updateItemStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Item status updated to " + status));
    }
}
