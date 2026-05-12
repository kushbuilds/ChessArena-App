package com.chessarena.repository;

import com.chessarena.model.Game;
import com.chessarena.model.GameMove;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GameMoveRepository extends JpaRepository<GameMove, Long> {
    List<GameMove> findByGameOrderByMoveNumberAsc(Game game);
}
