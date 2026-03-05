package com.proov.suvepraktika.controller.restauranttable;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTableDto {
    private Long id;
    private Integer tableNumber;
    private Integer seatCount;
    private String zone;
    private Set<String> features;
}
