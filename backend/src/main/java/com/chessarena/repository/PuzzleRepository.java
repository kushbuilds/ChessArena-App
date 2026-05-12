package com.chessarena.repository;

import com.chessarena.model.Puzzle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PuzzleRepository extends JpaRepository<Puzzle, Long> {
    @Query(value = "SELECT * FROM puzzle ORDER BY RANDOM()", nativeQuery = true)
    List<Puzzle> findRandom(Pageable pageable);

    @Query(value = "SELECT * FROM puzzle WHERE rating BETWEEN ?1 AND ?2 ORDER BY RANDOM()", nativeQuery = true)
    List<Puzzle> findByRatingRange(int min, int max, Pageable pageable);

    List<Puzzle> findByCategory(Puzzle.PuzzleCategory category);
}
