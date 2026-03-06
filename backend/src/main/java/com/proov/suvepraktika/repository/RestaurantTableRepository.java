package com.proov.suvepraktika.repository;

import com.proov.suvepraktika.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    List<RestaurantTable> findByZone(String zone);

    List<RestaurantTable> findBySeatCountGreaterThanEqual(Integer seatCount);

    @Query("SELECT t FROM RestaurantTable t WHERE (:zone IS NULL OR t.zone = :zone) AND (:minSeats IS NULL OR t.seatCount >= :minSeats) AND (:maxSeats IS NULL OR t.seatCount <= :maxSeats)")
    List<RestaurantTable> findByFilters(@Param("zone") String zone, @Param("minSeats") Integer minSeats, @Param("maxSeats") Integer maxSeats);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM RestaurantTable t WHERE t.id = :id")
    Optional<RestaurantTable> findByIdForUpdate(@Param("id") Long id);
}
