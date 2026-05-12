package com.chessarena.repository;

import com.chessarena.model.Puzzle;
import com.chessarena.model.PuzzleAttempt;
import com.chessarena.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PuzzleAttemptRepository extends JpaRepository<PuzzleAttempt, Long> {
    Optional<PuzzleAttempt> findByUserAndPuzzle(User user, Puzzle puzzle);
    List<PuzzleAttempt> findByUserOrderByAttemptedAtDesc(User user);
    long countByUserAndSolvedTrue(User user);
}
