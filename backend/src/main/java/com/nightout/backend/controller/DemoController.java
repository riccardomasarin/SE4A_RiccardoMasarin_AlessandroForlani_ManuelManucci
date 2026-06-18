package com.nightout.backend.controller;

import com.nightout.backend.dto.UserDto;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final UserService userService;

    public DemoController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<UserDto> getDemoUsers(@RequestParam(required = false) UserRole role) {
        return userService.findUsers(role);
    }

    @GetMapping("/session")
    public UserDto getDemoSession(@RequestParam(defaultValue = "NORMAL_USER") UserRole role) {
        return userService.findUsers(role).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No demo user found for role: " + role));
    }
}
