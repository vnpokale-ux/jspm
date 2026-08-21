package com.campus.lostandfound.dto.item;

import com.campus.lostandfound.dto.user.UserDto;
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
public class ItemResponseDto {
    private Long id;
    private Item.ItemType type;
    private String title;
    private String description;
    private String category;
    private String location;
    private LocalDateTime itemDate;
    private String imageUrl;
    private Item.ItemStatus status;
    private UserDto reporter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ItemResponseDto fromEntity(Item item) {
        if (item == null) return null;
        return ItemResponseDto.builder()
                .id(item.getId())
                .type(item.getType())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .location(item.getLocation())
                .itemDate(item.getItemDate())
                .imageUrl(item.getImageUrl())
                .status(item.getStatus())
                .reporter(UserDto.fromEntity(item.getReporter()))
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
