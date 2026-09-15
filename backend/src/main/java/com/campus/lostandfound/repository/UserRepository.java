package com.campus.lostandfound.repository;

import com.campus.lostandfound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByClerkId(String clerkId);
    Optional<User> findByEmail(String email);
    Optional<User> findByPrn(String prn);
    boolean existsByClerkId(String clerkId);
}
