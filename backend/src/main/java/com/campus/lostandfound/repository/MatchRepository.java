package com.campus.lostandfound.repository;

import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.Match;
import com.campus.lostandfound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    Optional<Match> findByLostItemAndFoundItem(Item lostItem, Item foundItem);

    boolean existsByLostItemAndFoundItem(Item lostItem, Item foundItem);

    List<Match> findByLostItemIdOrderByMatchScoreDesc(Long lostItemId);

    List<Match> findByFoundItemIdOrderByMatchScoreDesc(Long foundItemId);

    @Query("SELECT m FROM Match m WHERE m.lostItem.id = :itemId OR m.foundItem.id = :itemId ORDER BY m.matchScore DESC")
    List<Match> findAllByItemId(@Param("itemId") Long itemId);

    @Query("SELECT m FROM Match m WHERE (m.lostItem.reporter = :user OR m.foundItem.reporter = :user) ORDER BY m.createdAt DESC")
    List<Match> findAllByUserItems(@Param("user") User user);

    long countByStatus(Match.MatchStatus status);
}
