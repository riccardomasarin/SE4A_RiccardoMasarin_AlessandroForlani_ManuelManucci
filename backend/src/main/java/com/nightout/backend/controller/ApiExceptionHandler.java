package com.nightout.backend.controller;

import com.nightout.backend.dto.ApiErrorDto;
import com.nightout.backend.service.BadRequestException;
import com.nightout.backend.service.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorDto handleBadRequest(BadRequestException exception) {
        return new ApiErrorDto(HttpStatus.BAD_REQUEST.value(), exception.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorDto handleNotFound(NotFoundException exception) {
        return new ApiErrorDto(HttpStatus.NOT_FOUND.value(), exception.getMessage());
    }
}
