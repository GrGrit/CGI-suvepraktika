package com.proov.suvepraktika.mapper;

import com.proov.suvepraktika.controller.restauranttable.RestaurantTableDto;
import com.proov.suvepraktika.entity.RestaurantTable;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RestaurantTableMapper {

    RestaurantTableDto toDto(RestaurantTable entity);
}
