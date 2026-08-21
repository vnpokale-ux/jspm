package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.common.PageResponse;
import com.campus.lostandfound.dto.item.ItemFilterDto;
import com.campus.lostandfound.dto.item.ItemRequestDto;
import com.campus.lostandfound.dto.item.ItemResponseDto;
import com.campus.lostandfound.dto.item.ItemSummaryDto;
import com.campus.lostandfound.model.Item;

import java.util.List;

public interface ItemService {
    ItemResponseDto createItem(ItemRequestDto request);
    ItemResponseDto updateItem(Long id, ItemRequestDto request);
    ItemResponseDto getItemById(Long id);
    void deleteItem(Long id);
    ItemResponseDto updateItemStatus(Long id, Item.ItemStatus status);
    PageResponse<ItemResponseDto> searchItems(ItemFilterDto filter);
    PageResponse<ItemResponseDto> getMyItems(int page, int size, String sortBy, String sortDir);
    List<ItemSummaryDto> getRecentItems(int limit);
    List<String> getAllCategories();
    List<String> getAllLocations();
}
