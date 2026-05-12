package com.chessarena.repository;

import com.chessarena.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.blitzRating DESC")
    List<User> findTopBlitz(Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.bulletRating DESC")
    List<User> findTopBullet(Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.rapidRating DESC")
    List<User> findTopRapid(Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.classicalRating DESC")
    List<User> findTopClassical(Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.puzzleRating DESC")
    List<User> findTopPuzzle(Pageable pageable);

    List<User> findByUsernameContainingIgnoreCase(String query);
}
