package com.campus.lostandfound.repository;

import com.campus.lostandfound.model.Claim;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByClaimantOrderByCreatedAtDesc(User claimant);

    Page<Claim> findByClaimant(User claimant, Pageable pageable);

    @Query("SELECT c FROM Claim c WHERE c.item.reporter = :reporter ORDER BY c.createdAt DESC")
    List<Claim> findByItemReporter(@Param("reporter") User reporter);

    List<Claim> findByItemIdOrderByCreatedAtDesc(Long itemId);

    boolean existsByItemAndClaimant(Item item, User claimant);

    long countByStatus(Claim.ClaimStatus status);
}
