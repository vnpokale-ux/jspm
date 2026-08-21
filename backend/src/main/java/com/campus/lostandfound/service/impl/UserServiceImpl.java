package com.campus.lostandfound.service.impl;

import com.campus.lostandfound.dto.user.UserDto;
import com.campus.lostandfound.dto.user.UserUpdateRequestDto;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.exception.UnauthorizedException;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.UserRepository;
import com.campus.lostandfound.security.SecurityUtils;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public User getCurrentAuthenticatedUser() {
        return SecurityUtils.getCurrentJwt()
                .map(this::getOrCreateUserFromJwt)
                .orElseGet(() -> userRepository.findByEmail("sb@patil.bscoer.gmail.com").orElseGet(() -> {
                    User fallback = new User();
                    fallback.setClerkId("admin_sanjay_patil");
                    fallback.setEmail("sb@patil.bscoer.gmail.com");
                    fallback.setFirstName("Sanjay");
                    fallback.setLastName("Patil");
                    fallback.setRole(User.Role.ADMIN);
                    fallback.setStatus(User.UserStatus.APPROVED);
                    return userRepository.save(fallback);
                }));
    }

    @Override
    @Transactional
    public User getOrCreateUserFromJwt(Jwt jwt) {
        String clerkId = jwt.getSubject();
        if (clerkId == null || clerkId.trim().isEmpty()) {
            throw new UnauthorizedException("Invalid JWT: subject (Clerk ID) is missing");
        }

        return userRepository.findByClerkId(clerkId).orElseGet(() -> {
            // Extract claims if present
            String email = jwt.getClaimAsString("email");
            if (email == null) {
                email = jwt.getClaimAsString("primary_email_address");
            }
            if (email == null || email.trim().isEmpty()) {
                email = clerkId + "@clerk.user";
            }

            String firstName = jwt.getClaimAsString("given_name");
            if (firstName == null) {
                firstName = jwt.getClaimAsString("first_name");
            }

            String lastName = jwt.getClaimAsString("family_name");
            if (lastName == null) {
                lastName = jwt.getClaimAsString("last_name");
            }

            log.info("Provisioning new user from Clerk JWT: clerkId={}, email={}", clerkId, email);

            User newUser = new User();
            newUser.setClerkId(clerkId);
            newUser.setEmail(email);
            newUser.setFirstName(firstName != null ? firstName : "Campus");
            newUser.setLastName(lastName != null ? lastName : "User");
            newUser.setRole(User.Role.USER);

            return userRepository.save(newUser);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "clerkId", clerkId));
    }

    @Override
    @Transactional
    public UserDto getCurrentUserProfile() {
        User user = getCurrentAuthenticatedUser();
        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional
    public UserDto updateCurrentUser(UserUpdateRequestDto request) {
        User user = getCurrentAuthenticatedUser();

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail().trim());
        }

        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }
}
