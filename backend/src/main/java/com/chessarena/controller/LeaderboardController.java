package com.chessarena.controller;

import com.chessarena.dto.user.UserProfileDTO;
import com.chessarena.model.User;
import com.chessarena.repository.UserRepository;
import com.chessarena.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepo;
    private final UserService    userService;

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> blitz() {
        return ResponseEntity.ok(map(userRepo.findTopBlitz(PageRequest.of(0, 50))));
    }

    @GetMapping("/bullet")
    public ResponseEntity<List<UserProfileDTO>> bullet() {
        return ResponseEntity.ok(map(userRepo.findTopBullet(PageRequest.of(0, 50))));
    }

    @GetMapping("/blitz")
    public ResponseEntity<List<UserProfileDTO>> blitzExplicit() {
        return ResponseEntity.ok(map(userRepo.findTopBlitz(PageRequest.of(0, 50))));
    }

    @GetMapping("/rapid")
    public ResponseEntity<List<UserProfileDTO>> rapid() {
        return ResponseEntity.ok(map(userRepo.findTopRapid(PageRequest.of(0, 50))));
    }

    @GetMapping("/classical")
    public ResponseEntity<List<UserProfileDTO>> classical() {
        return ResponseEntity.ok(map(userRepo.findTopClassical(PageRequest.of(0, 50))));
    }

    @GetMapping("/puzzle")
    public ResponseEntity<List<UserProfileDTO>> puzzle() {
        return ResponseEntity.ok(map(userRepo.findTopPuzzle(PageRequest.of(0, 50))));
    }

    private List<UserProfileDTO> map(List<User> users) {
        return users.stream().map(userService::toProfile).collect(Collectors.toList());
    }
}
