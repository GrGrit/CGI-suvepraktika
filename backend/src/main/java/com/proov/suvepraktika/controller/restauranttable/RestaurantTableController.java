package com.proov.suvepraktika.controller.restauranttable;

import com.proov.suvepraktika.service.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    @GetMapping
    public List<RestaurantTableDto> getAllTables() {
        return tableService.getAllTables();
    }

    @GetMapping("/{id}")
    public RestaurantTableDto getTableById(@PathVariable Long id) {
        return tableService.getTableById(id);
    }
}
