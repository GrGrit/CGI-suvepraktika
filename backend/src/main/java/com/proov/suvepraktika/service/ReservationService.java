package com.proov.suvepraktika.service;

import com.proov.suvepraktika.controller.reservation.ReservationDto;
import com.proov.suvepraktika.controller.reservation.ReservationSearchRequestDto;
import com.proov.suvepraktika.controller.reservation.TableRecommendationRequestDto;
import com.proov.suvepraktika.controller.restauranttable.RestaurantTableDto;
import com.proov.suvepraktika.entity.Reservation;
import com.proov.suvepraktika.entity.RestaurantTable;
import com.proov.suvepraktika.mapper.ReservationMapper;
import com.proov.suvepraktika.mapper.RestaurantTableMapper;
import com.proov.suvepraktika.repository.ReservationRepository;
import com.proov.suvepraktika.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final ReservationMapper reservationMapper;
    private final RestaurantTableMapper tableMapper;

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
        RestaurantTable table = tableRepository.findByIdForUpdate(dto.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + dto.getTableId()));

        // re-check overlapping reservations for this table in the same time window
        List<Reservation> overlapping = reservationRepository.findOverlappingForTable(table.getId(), dto.getReservationDate(), dto.getStartTime(), dto.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Table already booked in the requested time range");
        }

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

    // Used AI to write the logic for fetching available tables based on the reservation search criteria
    // including filtering by zone, party size, and required features, as well as checking for overlapping reservations.
    public List<RestaurantTableDto> getAvailableTables(ReservationSearchRequestDto request) {
        if (request.getReservationDate() == null || request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("reservationDate, startTime and endTime must be provided");
        }

        List<RestaurantTable> candidates = tableRepository.findByFilters(
                request.getZone(), request.getMinPartySize(), request.getMaxPartySize());

        Set<Long> occupiedTableIds = reservationRepository
                .findOverlapping(request.getReservationDate(), request.getStartTime(), request.getEndTime())
                .stream()
                .filter(r -> r.getTable() != null)
                .map(r -> r.getTable().getId())
                .collect(Collectors.toSet());

        return candidates.stream()
                .filter(t -> !occupiedTableIds.contains(t.getId()))
                .filter(t -> request.getRequiredFeatures() == null
                        || request.getRequiredFeatures().isEmpty()
                        || (t.getFeatures() != null && t.getFeatures().containsAll(request.getRequiredFeatures())))
                .map(tableMapper::toDto)
                .toList();
    }

    // Filtering and scoring logic for table recommendations based on the request parameters and restaurant data.
    // The code was written by AI.
    public List<RestaurantTableDto> recommendTables(TableRecommendationRequestDto request, int limit) {
        // Basic validation
        if (request.getReservationDate() == null || request.getStartTime() == null || request.getEndTime() == null || request.getPartySize() == null) {
            throw new IllegalArgumentException("reservationDate, startTime, endTime and partySize must be provided");
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        int partySize = request.getPartySize();
        int maxSeats = request.getAllowOversize() != null && request.getAllowOversize() ? Integer.MAX_VALUE : Math.max(partySize, partySize * 2);

        // buffers
        LocalTime startWith = request.getStartTime().minusMinutes(Optional.ofNullable(request.getBufferMinutesBefore()).orElse(0));
        LocalTime endWith = request.getEndTime().plusMinutes(Optional.ofNullable(request.getBufferMinutesAfter()).orElse(0));

        // fetch candidate tables (filtered by zone and seat range)
        List<RestaurantTable> candidates = tableRepository.findByFilters(request.getPreferredZone(), partySize, maxSeats);

        // fetch overlapping reservations for the whole restaurant in that time window and date
        List<Reservation> overlapping = reservationRepository.findOverlapping(request.getReservationDate(), startWith, endWith);
        Map<Long, List<Reservation>> overlapsByTable = new HashMap<>();
        for (Reservation r : overlapping) {
            if (r.getTable() != null && r.getTable().getId() != null) {
                overlapsByTable.computeIfAbsent(r.getTable().getId(), k -> new ArrayList<>()).add(r);
            }
        }

        // Filter available tables and required features
        List<RestaurantTable> available = new ArrayList<>();
        for (RestaurantTable t : candidates) {
            if (overlapsByTable.containsKey(t.getId())) continue; // occupied
            if (request.getRequiredFeatures() != null && !request.getRequiredFeatures().isEmpty()) {
                if (t.getFeatures() == null || !t.getFeatures().containsAll(request.getRequiredFeatures())) continue;
            }
            available.add(t);
        }

        // If none available, try relaxing maxSeats up to the maximum table seat in DB

        // Score the available tables
        class Scored {
            RestaurantTable table;
            int score;
            Scored(RestaurantTable table, int score) { this.table = table; this.score = score; }
        }

        List<Scored> scored = new ArrayList<>();
        for (RestaurantTable t : available) {
            int base = 100;
            int wastePenalty = (t.getSeatCount() - partySize) * 10; // larger tables penalized
            int prefBonus = 0;
            if (request.getPreferredFeatures() != null && !request.getPreferredFeatures().isEmpty() && t.getFeatures() != null) {
                for (String f : request.getPreferredFeatures()) {
                    if (t.getFeatures().contains(f)) prefBonus += 15;
                }
            }
            int zoneBonus = (request.getPreferredZone() != null && request.getPreferredZone().equals(t.getZone())) ? 10 : 0;
            int finalScore = base - wastePenalty + prefBonus + zoneBonus;
            scored.add(new Scored(t, finalScore));
        }

        // sort by score desc, seatCount asc, tableNumber asc
        scored.sort(Comparator.comparingInt((Scored s) -> -s.score)
                .thenComparingInt(s -> s.table.getSeatCount())
                .thenComparingInt(s -> s.table.getTableNumber()));

        // map to DTOs and limit
        return scored.stream()
                .map(s -> tableMapper.toDto(s.table))
                .limit(limit <= 0 ? 5 : limit)
                .toList();
    }
}
