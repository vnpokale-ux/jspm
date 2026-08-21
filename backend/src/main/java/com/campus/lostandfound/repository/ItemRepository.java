package com.campus.lostandfound.repository;

import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    Page<Item> findByReporter(User reporter, Pageable pageable);

    List<Item> findByReporter(User reporter);

    List<Item> findByTypeAndStatus(Item.ItemType type, Item.ItemStatus status);

    long countByTypeAndStatus(Item.ItemType type, Item.ItemStatus status);

    long countByStatus(Item.ItemStatus status);

    List<Item> findTop10ByStatusOrderByCreatedAtDesc(Item.ItemStatus status);

    @Query("SELECT i.category, COUNT(i) FROM Item i GROUP BY i.category")
    List<Object[]> countItemsGroupedByCategory();

    @Query("SELECT i.location, COUNT(i) FROM Item i GROUP BY i.location")
    List<Object[]> countItemsGroupedByLocation();

    @Query("SELECT DISTINCT i.category FROM Item i WHERE i.category IS NOT NULL")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT i.location FROM Item i WHERE i.location IS NOT NULL")
    List<String> findDistinctLocations();
}
