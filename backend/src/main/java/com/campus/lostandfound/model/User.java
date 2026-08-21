package com.campus.lostandfound.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The unique ID provided by Clerk authentication
    @Column(unique = true, nullable = false)
    private String clerkId;

    @Column(nullable = false)
    private String email;

    private String firstName;
    private String lastName;
    private String prn;
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        USER, ADMIN
    }

    public enum UserStatus {
        PENDING, APPROVED, REJECTED
    }
}
