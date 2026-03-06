package com.proov.suvepraktika.controller.reservation;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationSearchRequestDto {
    private LocalDate reservationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer minPartySize;
    private Integer maxPartySize;
    private String zone;
    private Set<String> requiredFeatures;
    private Set<String> preferredFeatures;
}
