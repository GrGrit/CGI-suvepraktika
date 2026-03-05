package com.proov.suvepraktika.service;

import com.proov.suvepraktika.controller.reservation.ReservationDto;
import com.proov.suvepraktika.entity.Reservation;
import com.proov.suvepraktika.entity.RestaurantTable;
import com.proov.suvepraktika.mapper.ReservationMapper;
import com.proov.suvepraktika.repository.ReservationRepository;
import com.proov.suvepraktika.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final ReservationMapper reservationMapper;

    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(reservationMapper::toDto)
                .toList();
    }

    public List<ReservationDto> getReservationsByDate(LocalDate date) {
        return reservationRepository.findByReservationDate(date)
                .stream()
                .map(reservationMapper::toDto)
                .toList();
    }

    public ReservationDto getReservationById(Long id) {
        return reservationRepository.findById(id)
                .map(reservationMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
    }

    @Transactional
    public ReservationDto createReservation(ReservationDto dto) {
        RestaurantTable table = tableRepository.findById(dto.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + dto.getTableId()));

        Reservation reservation = reservationMapper.toEntity(dto);
        reservation.setTable(table);

        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toDto(saved);
    }

    @Transactional
    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new RuntimeException("Reservation not found with id: " + id);
        }
        reservationRepository.deleteById(id);
    }
}
