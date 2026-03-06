package com.proov.suvepraktika.repository;

import com.proov.suvepraktika.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByReservationDate(LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.reservationDate = :date AND (r.startTime < :endTime AND r.endTime > :startTime)")
    List<Reservation> findOverlapping(@Param("date") LocalDate date, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);

    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId AND r.reservationDate = :date AND (r.startTime < :endTime AND r.endTime > :startTime)")
    List<Reservation> findOverlappingForTable(@Param("tableId") Long tableId, @Param("date") LocalDate date, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);
}
