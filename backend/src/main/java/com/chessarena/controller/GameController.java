package com.chessarena.controller;

import com.chessarena.chess.*;
import com.chessarena.dto.game.*;
import com.chessarena.model.Game;
import com.chessarena.service.GameService;
import com.chessarena.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createGame(Principal principal,
                                                           @RequestBody CreateGameRequest req) {
        Long userId = userService.getCurrentUser(principal).getId();
        String username = principal.getName();
        Game game = gameService.createGame(userId, req);

        // If vs computer and computer is white, make the first move
        if (game.isVsComputer() && game.getWhitePlayer() == null) {
            gameService.processComputerMove(game.getId());
            game = gameService.getGame(game.getId());
        }

        String yourColor = (game.getWhitePlayer() != null && game.getWhitePlayer().getUsername().equals(username))
                ? "white" : "black";

        Map<String, Object> resp = new HashMap<>();
        resp.put("gameId", game.getId());
        resp.put("yourColor", yourColor);
        resp.put("status", game.getStatus().name());
        resp.put("whitePlayer", game.getWhitePlayer() != null ? game.getWhitePlayer().getUsername() : "Computer");
        resp.put("blackPlayer", game.getBlackPlayer() != null ? game.getBlackPlayer().getUsername() : "Computer");
        resp.put("timeControl", game.getTimeControl().name());
        resp.put("timeControlLabel", game.getTimeControl().label);
        resp.put("whiteTime", game.getWhiteTimeRemaining());
        resp.put("blackTime", game.getBlackTimeRemaining());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<Map<String, Object>> getGame(@PathVariable Long gameId) {
        Game game = gameService.getGame(gameId);
        return ResponseEntity.ok(gameToMap(game));
    }

    @GetMapping("/history/{username}")
    public ResponseEntity<List<Map<String, Object>>> getGameHistory(@PathVariable String username) {
        List<Game> games = gameService.getGameHistory(username);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Game g : games) result.add(gameToMap(g));
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> gameToMap(Game g) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", g.getId());
        m.put("whitePlayer", g.getWhitePlayer() != null ? g.getWhitePlayer().getUsername() : "Computer");
        m.put("blackPlayer", g.getBlackPlayer() != null ? g.getBlackPlayer().getUsername() : "Computer");
        m.put("whiteRating", g.getWhitePlayer() != null ? g.getWhitePlayer().getBlitzRating() : 1500);
        m.put("blackRating", g.getBlackPlayer() != null ? g.getBlackPlayer().getBlitzRating() : 1500);
        m.put("status", g.getStatus().name());
        m.put("result", g.getResult() != null ? g.getResult().name() : null);
        m.put("winner", g.getWinner());
        m.put("resultReason", g.getResultReason());
        m.put("currentFen", g.getCurrentFen());
        m.put("pgn", g.getPgn());
        m.put("timeControl", g.getTimeControl().name());
        m.put("timeControlLabel", g.getTimeControl().label);
        m.put("whiteTime", g.getWhiteTimeRemaining());
        m.put("blackTime", g.getBlackTimeRemaining());
        m.put("isVsComputer", g.isVsComputer());
        m.put("createdAt", g.getCreatedAt());
        m.put("endedAt", g.getEndedAt());
        // Include legal moves so frontend knows what's playable
        if (g.getStatus() == Game.GameStatus.ONGOING) {
            ChessBoard board = ChessBoard.fromFen(g.getCurrentFen());
            m.put("legalMoves", ChessEngine.getLegalMoves(board).stream()
                    .map(ChessMove::toUci).collect(Collectors.toList()));
            m.put("isInCheck", ChessEngine.isInCheck(board, board.getTurn()));
        } else {
            m.put("legalMoves", List.of());
            m.put("isInCheck", false);
        }
        return m;
    }
}
