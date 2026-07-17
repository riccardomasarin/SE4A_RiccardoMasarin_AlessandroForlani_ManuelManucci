package com.nightout.backend.controller;

import com.nightout.backend.dto.FriendshipDto;
import com.nightout.backend.dto.FriendUserDto;
import com.nightout.backend.dto.SendFriendRequestDto;
import com.nightout.backend.service.FriendshipService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/friendships")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(
            FriendshipService friendshipService
    ) {
        this.friendshipService = friendshipService;
    }

    @GetMapping("/search")
    public List<FriendUserDto> searchUsers(
            @RequestParam Long currentUserId,
            @RequestParam String query
    ) {
        return friendshipService.searchUsers(
                currentUserId,
                query
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FriendshipDto sendRequest(
            @RequestBody SendFriendRequestDto request
    ) {
        return friendshipService.sendRequest(request);
    }

    @GetMapping("/users/{userId}/requests/received")
    public List<FriendshipDto> getReceivedRequests(
            @PathVariable Long userId
    ) {
        return friendshipService.getReceivedRequests(
                userId
        );
    }

    @GetMapping("/users/{userId}/requests/sent")
    public List<FriendshipDto> getSentRequests(
            @PathVariable Long userId
    ) {
        return friendshipService.getSentRequests(
                userId
        );
    }

    @GetMapping("/users/{userId}/friends")
    public List<FriendUserDto> getFriends(
            @PathVariable Long userId
    ) {
        return friendshipService.getFriends(userId);
    }

    @PatchMapping("/{friendshipId}/accept")
    public FriendshipDto acceptRequest(
            @PathVariable Long friendshipId,
            @RequestParam Long receiverId
    ) {
        return friendshipService.acceptRequest(
                friendshipId,
                receiverId
        );
    }

    @PatchMapping("/{friendshipId}/reject")
    public FriendshipDto rejectRequest(
            @PathVariable Long friendshipId,
            @RequestParam Long receiverId
    ) {
        return friendshipService.rejectRequest(
                friendshipId,
                receiverId
        );
    }

    @DeleteMapping(
            "/users/{userId}/friends/{friendUserId}"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFriend(
            @PathVariable Long userId,
            @PathVariable Long friendUserId
    ) {
        friendshipService.removeFriend(
                userId,
                friendUserId
        );
    }

    @GetMapping(
            "/users/{userId}/events/{eventId}/friends-attending"
    )
    public List<FriendUserDto> getFriendsAttending(
            @PathVariable Long userId,
            @PathVariable Long eventId
    ) {
        return friendshipService.getFriendsAttending(
                userId,
                eventId
        );
    }
}