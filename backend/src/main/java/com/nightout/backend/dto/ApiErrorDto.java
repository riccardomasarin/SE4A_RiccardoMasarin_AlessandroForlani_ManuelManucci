package com.nightout.backend.dto;

public record ApiErrorDto(
        int status,
        String message
) {
}
