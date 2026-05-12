package com.chessarena.repository;

import com.chessarena.model.Game;
import com.chessarena.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    @Query("SELECT g FROM Game g WHERE (g.whitePlayer = ?1 OR g.blackPlayer = ?1) ORDER BY g.createdAt DESC")
    List<Game> findByPlayer(User user);

    @Query("SELECT g FROM Game g WHERE (g.whitePlayer = ?1 OR g.blackPlayer = ?1) AND g.status = 'ONGOING'")
    Optional<Game> findActiveGameByPlayer(User user);

    @Query("SELECT g FROM Game g WHERE g.status = 'WAITING' AND g.isVsComputer = false AND g.timeControl = ?1")
    List<Game> findWaitingGamesByTimeControl(Game.TimeControl timeControl);
}
