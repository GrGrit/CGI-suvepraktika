package com.proov.suvepraktika.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "restaurant_table")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer tableNumber;
    private Integer seatCount;
    private String zone;
    @ElementCollection
    @CollectionTable(name = "table_feature", joinColumns = @JoinColumn(name = "table_id"))
    @Column(name = "feature")
    private Set<String> features = new HashSet<>();
}
