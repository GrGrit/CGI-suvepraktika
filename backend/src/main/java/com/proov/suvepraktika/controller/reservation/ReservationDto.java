package com.proov.suvepraktika.controller.reservation;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {
    private Long id;
    private Long tableId;
    private Integer tableNumber;
    private LocalDate reservationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer partySize;
    private String customerName;
    private String customerPhone;
}
