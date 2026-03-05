package com.proov.suvepraktika.service;

import com.proov.suvepraktika.controller.restauranttable.RestaurantTableDto;
import com.proov.suvepraktika.mapper.RestaurantTableMapper;
import com.proov.suvepraktika.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final RestaurantTableMapper tableMapper;

    public List<RestaurantTableDto> getAllTables() {
        return tableRepository.findAll()
                .stream()
                .map(tableMapper::toDto)
                .toList();
    }

    public RestaurantTableDto getTableById(Long id) {
        return tableRepository.findById(id)
                .map(tableMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
    }
}
