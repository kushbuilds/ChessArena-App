package com.chessarena.controller;

import com.chessarena.dto.user.*;
import com.chessarena.model.*;
import com.chessarena.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getProfile(username));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(Principal principal,
                                                         @RequestBody Map<String, String> updates) {
        User user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(userService.updateProfile(user.getId(), updates));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<UserDTO>> getFriends(Principal principal) {
        User user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(userService.getFriends(user.getId()));
    }

    @PostMapping("/friends/{username}")
    public ResponseEntity<Friendship> sendFriendRequest(Principal principal,
                                                         @PathVariable String username) {
        User user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(userService.sendFriendRequest(user.getId(), username));
    }

    @PutMapping("/friends/{id}/accept")
    public ResponseEntity<Friendship> acceptFriendRequest(Principal principal,
                                                           @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(userService.acceptFriendRequest(id, user.getId()));
    }

    @DeleteMapping("/friends/{id}")
    public ResponseEntity<Void> removeFriend(Principal principal, @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        userService.removeFriend(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/friends/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests(Principal principal) {
        User user = userService.getCurrentUser(principal);
        List<Friendship> pending = userService.getPendingRequests(user.getId());
        List<Map<String, Object>> result = pending.stream().map(f -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", f.getId());
            m.put("requester", userService.toDTO(f.getRequester()));
            m.put("createdAt", f.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
