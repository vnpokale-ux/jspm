package com.campus.lostandfound.service;

import com.campus.lostandfound.model.Item;

public interface MatchingService {
    void processItemForMatches(Item item);
    double calculateMatchScore(Item lostItem, Item foundItem);
}
