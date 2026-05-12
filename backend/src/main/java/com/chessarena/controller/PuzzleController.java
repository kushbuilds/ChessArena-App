package com.chessarena.controller;

import com.chessarena.dto.puzzle.*;
import com.chessarena.service.PuzzleService;
import com.chessarena.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/puzzles")
@RequiredArgsConstructor
public class PuzzleController {

    private final PuzzleService puzzleService;
    private final UserService   userService;

    @GetMapping("/daily")
    public ResponseEntity<PuzzleDTO> daily() {
        return ResponseEntity.ok(puzzleService.getDailyPuzzle());
    }

    @GetMapping("/random")
    public ResponseEntity<PuzzleDTO> random(Principal principal) {
        int rating = 1200;
        if (principal != null) {
            try { rating = userService.getByUsername(principal.getName()).getPuzzleRating(); }
            catch (Exception ignored) {}
        }
        return ResponseEntity.ok(puzzleService.getRandomPuzzle(rating));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PuzzleDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(puzzleService.getPuzzleById(id));
    }

    @PostMapping("/{id}/attempt")
    public ResponseEntity<Map<String, Object>> attempt(@PathVariable Long id,
                                                        @RequestBody PuzzleAttemptRequest req,
                                                        Principal principal) {
        Long userId = null;
        if (principal != null) {
            try { userId = userService.getByUsername(principal.getName()).getId(); }
            catch (Exception ignored) {}
        }
        req.setPuzzleId(id);
        return ResponseEntity.ok(puzzleService.checkSolution(id, userId, req));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<PuzzleDTO>> byCategory(@PathVariable String category) {
        return ResponseEntity.ok(puzzleService.getPuzzlesByCategory(category));
    }
}
