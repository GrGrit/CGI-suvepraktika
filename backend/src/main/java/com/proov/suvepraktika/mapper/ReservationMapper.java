package com.proov.suvepraktika.mapper;

import com.proov.suvepraktika.controller.reservation.ReservationDto;
import com.proov.suvepraktika.entity.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReservationMapper {

    @Mapping(source = "table.id", target = "tableId")
    @Mapping(source = "table.tableNumber", target = "tableNumber")
    ReservationDto toDto(Reservation entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "table", ignore = true)
    Reservation toEntity(ReservationDto dto);
}
