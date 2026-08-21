package com.campus.lostandfound.dto.item;

import com.campus.lostandfound.model.Item;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemSummaryDto {
    private Long id;
    private Item.ItemType type;
    private String title;
    private String category;
    private String location;
    private String imageUrl;
    private Item.ItemStatus status;
    private LocalDateTime itemDate;
    private LocalDateTime createdAt;

    public static ItemSummaryDto fromEntity(Item item) {
        if (item == null) return null;
        return ItemSummaryDto.builder()
                .id(item.getId())
                .type(item.getType())
                .title(item.getTitle())
                .category(item.getCategory())
                .location(item.getLocation())
                .imageUrl(item.getImageUrl())
                .status(item.getStatus())
                .itemDate(item.getItemDate())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
