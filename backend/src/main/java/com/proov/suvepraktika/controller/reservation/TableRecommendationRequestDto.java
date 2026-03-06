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
public class TableRecommendationRequestDto {
    private LocalDate reservationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer partySize;
    private String preferredZone;
    private Set<String> requiredFeatures;
    private Set<String> preferredFeatures;
    private Boolean allowOversize = false;
    private Integer bufferMinutesBefore = 0;
    private Integer bufferMinutesAfter = 0;
}
