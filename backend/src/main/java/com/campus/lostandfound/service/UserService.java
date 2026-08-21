package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.dto.user.UserUpdateRequestDto;
import com.campus.lostandfound.model.User;
import org.springframework.security.oauth2.jwt.Jwt;

public interface UserService {
    User getCurrentAuthenticatedUser();
    User getOrCreateUserFromJwt(Jwt jwt);
    User getUserById(Long id);
    User getUserByClerkId(String clerkId);
    UserDto getCurrentUserProfile();
    UserDto updateCurrentUser(UserUpdateRequestDto request);
}
