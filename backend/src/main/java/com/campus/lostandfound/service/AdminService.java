package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.admin.AdminStatsDto;
import com.campus.lostandfound.dto.claim.ClaimResponseDto;
import com.campus.lostandfound.dto.common.PageResponse;
import com.campus.lostandfound.dto.item.ItemResponseDto;
import com.campus.lostandfound.dto.match.MatchResponseDto;
import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.model.User;

public interface AdminService {
    AdminStatsDto getDashboardStats();
    PageResponse<UserDto> getAllUsers(int page, int size);
    UserDto updateUserRole(Long userId, User.Role role);
    UserDto approveUser(Long userId);
    void rejectUser(Long userId);
    PageResponse<ItemResponseDto> getAllItems(int page, int size, String sortBy, String sortDir);
    void adminDeleteItem(Long itemId);
    PageResponse<ClaimResponseDto> getAllClaims(int page, int size);
    PageResponse<MatchResponseDto> getAllMatches(int page, int size);
    byte[] exportItemsCsv();
}
