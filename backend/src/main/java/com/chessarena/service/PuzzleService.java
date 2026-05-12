package com.chessarena.service;

import com.chessarena.dto.puzzle.*;
import com.chessarena.model.*;
import com.chessarena.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PuzzleService {

    private final PuzzleRepository        puzzleRepo;
    private final PuzzleAttemptRepository attemptRepo;
    private final UserRepository          userRepo;

    public PuzzleDTO getDailyPuzzle() {
        long total = puzzleRepo.count();
        if (total == 0) return null;
        long idx = LocalDate.now().getDayOfYear() % total;
        List<Puzzle> all = puzzleRepo.findAll(PageRequest.of((int) idx, 1)).getContent();
        return all.isEmpty() ? null : toDTO(all.get(0));
    }

    public PuzzleDTO getRandomPuzzle(int userRating) {
        int min = Math.max(0, userRating - 200), max = userRating + 200;
        List<Puzzle> puzzles = puzzleRepo.findByRatingRange(min, max, PageRequest.of(0, 1));
        if (puzzles.isEmpty()) puzzles = puzzleRepo.findRandom(PageRequest.of(0, 1));
        return puzzles.isEmpty() ? null : toDTO(puzzles.get(0));
    }

    public PuzzleDTO getPuzzleById(Long id) {
        return puzzleRepo.findById(id).map(this::toDTO).orElseThrow();
    }

    public List<PuzzleDTO> getPuzzlesByCategory(String category) {
        Puzzle.PuzzleCategory cat = Puzzle.PuzzleCategory.valueOf(category.toUpperCase());
        return puzzleRepo.findByCategory(cat).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> checkSolution(Long puzzleId, Long userId, PuzzleAttemptRequest req) {
        Puzzle puzzle = puzzleRepo.findById(puzzleId).orElseThrow();
        String correct = puzzle.getSolutionMoves().trim();
        String submitted = req.getMoves() == null ? "" : req.getMoves().trim();
        boolean solved = correct.equalsIgnoreCase(submitted)
                || submitted.startsWith(correct.split(" ")[0]);

        puzzle.setTimesAttempted(puzzle.getTimesAttempted() + 1);
        if (solved) puzzle.setTimesSolved(puzzle.getTimesSolved() + 1);
        puzzleRepo.save(puzzle);

        if (userId != null) {
            userRepo.findById(userId).ifPresent(user -> {
                PuzzleAttempt attempt = PuzzleAttempt.builder()
                        .user(user).puzzle(puzzle).solved(solved)
                        .timeSpentSeconds(req.getTimeSpentSeconds()).build();
                attemptRepo.save(attempt);
                if (solved) {
                    user.setPuzzlesSolved(user.getPuzzlesSolved() + 1);
                    user.setPuzzleRating(user.getPuzzleRating() + (solved ? 5 : -3));
                    userRepo.save(user);
                }
            });
        }

        Map<String, Object> result = new HashMap<>();
        result.put("solved", solved);
        result.put("solution", puzzle.getSolutionMoves());
        return result;
    }

    private PuzzleDTO toDTO(Puzzle p) {
        return PuzzleDTO.builder()
                .id(p.getId()).fen(p.getFen()).rating(p.getRating())
                .category(p.getCategory() != null ? p.getCategory().name() : null)
                .title(p.getTitle()).description(p.getDescription())
                .timesAttempted(p.getTimesAttempted()).timesSolved(p.getTimesSolved())
                .build();
    }
}
