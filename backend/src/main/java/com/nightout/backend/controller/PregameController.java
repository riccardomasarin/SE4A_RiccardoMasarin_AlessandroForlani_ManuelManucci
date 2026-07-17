package com.nightout.backend.controller;

import com.nightout.backend.dto.CreatePregameRoomDto;
import com.nightout.backend.dto.PregameRoomDto;
import com.nightout.backend.service.PregameService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api")
public class PregameController {

    private final PregameService pregameService;

    public PregameController(PregameService pregameService) {
        this.pregameService = pregameService;
    }

    @GetMapping("/pregames")
    public List<PregameRoomDto> getPregames(@RequestParam(required = false) Long eventId) {
        return pregameService.findPregames(eventId);
    }

    @GetMapping("/events/{eventId}/pregames")
    public List<PregameRoomDto> getEventPregames(@PathVariable Long eventId) {
        return pregameService.findPregames(eventId);
    }

    @GetMapping("/pregames/{roomId}")
    public PregameRoomDto getPregame(@PathVariable Long roomId) {
        return pregameService.getPregame(roomId);
    }

    @PostMapping("/pregames")
    @ResponseStatus(HttpStatus.CREATED)
    public PregameRoomDto createPregame(@Valid @RequestBody CreatePregameRoomDto request) {
        return pregameService.createPregame(request);
    }

    @PostMapping("/pregames/{roomId}/join")
    public PregameRoomDto joinPregame(@PathVariable Long roomId, @RequestParam Long userId) {
        return pregameService.joinPregame(roomId, userId);
    }

    @PostMapping("/pregames/{roomId}/leave")
    public PregameRoomDto leavePregame(@PathVariable Long roomId, @RequestParam Long userId) {
        return pregameService.leavePregame(roomId, userId);
    }
    @DeleteMapping("/pregames/{roomId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePregame(
        @PathVariable Long roomId,
        @RequestParam Long userId
    ) {
    pregameService.deletePregame(roomId, userId);
    }
}
