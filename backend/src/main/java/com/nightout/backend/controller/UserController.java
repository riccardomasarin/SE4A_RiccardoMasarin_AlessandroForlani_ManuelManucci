package com.nightout.backend.controller;

import com.nightout.backend.dto.ProfileDto;
import com.nightout.backend.dto.UserDto;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDto> getUsers(@RequestParam(required = false) UserRole role) {
        return userService.findUsers(role);
    }

    @GetMapping("/{userId}")
    public UserDto getUser(@PathVariable Long userId) {
        return userService.getUser(userId);
    }

    @GetMapping("/{userId}/profile")
    public ProfileDto getProfile(@PathVariable Long userId) {
        return userService.getProfile(userId);
    }
}
