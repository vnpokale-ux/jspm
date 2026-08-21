package com.campus.lostandfound.dto.item;

import com.campus.lostandfound.model.Item;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class ItemFilterDto {
    private String query;
    private Item.ItemType type;
    private String category;
    private String location;
    private Item.ItemStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endDate;

    private int page = 0;
    private int size = 12;
    private String sortBy = "createdAt";
    private String sortDir = "desc";
}
