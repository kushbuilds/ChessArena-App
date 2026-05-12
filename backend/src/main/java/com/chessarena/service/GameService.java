package com.chessarena.service;

import com.chessarena.chess.*;
import com.chessarena.dto.game.*;
import com.chessarena.model.*;
import com.chessarena.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository     gameRepo;
    private final GameMoveRepository moveRepo;
    private final UserRepository     userRepo;
    private final EloService         eloService;
    private final UserService        userService;

    @Transactional
    public Game createGame(Long userId, CreateGameRequest req) {
        User user = userRepo.findById(userId).orElseThrow();

        Game.TimeControl tc = Game.TimeControl.valueOf(
                req.getTimeControl() != null ? req.getTimeControl() : "BLITZ_5");

        User white, black;
        boolean vsComputer = req.isVsComputer();

        if (vsComputer) {
            String color = req.getColor();
            if ("black".equals(color) || ("random".equals(color) && new Random().nextBoolean())) {
                white = null; black = user;
            } else {
                white = user; black = null;
            }
        } else {
            // Check if there's a waiting game to join
            List<Game> waiting = gameRepo.findWaitingGamesByTimeControl(tc);
            if (!waiting.isEmpty()) {
                Game existing = waiting.get(0);
                if (!existing.getWhitePlayer().getId().equals(userId)) {
                    return joinGame(existing.getId(), userId);
                }
            }
            white = user; black = null;
        }

        Game game = Game.builder()
                .whitePlayer(white).blackPlayer(black)
                .timeControl(tc)
                .whiteTimeRemaining(tc.baseTime)
                .blackTimeRemaining(tc.baseTime)
                .isVsComputer(vsComputer)
                .computerLevel(req.getComputerLevel() > 0 ? req.getComputerLevel() : 10)
                .status(vsComputer ? Game.GameStatus.ONGOING : Game.GameStatus.WAITING)
                .build();

        if (vsComputer) game.setStartedAt(java.time.LocalDateTime.now());
        return gameRepo.save(game);
    }

    @Transactional
    public Game joinGame(Long gameId, Long userId) {
        Game game = gameRepo.findById(gameId).orElseThrow();
        User joiner = userRepo.findById(userId).orElseThrow();

        if (game.getWhitePlayer() == null) {
            game.setWhitePlayer(joiner);
        } else if (game.getBlackPlayer() == null) {
            game.setBlackPlayer(joiner);
        } else {
            throw new IllegalStateException("Game is full");
        }
        game.setStatus(Game.GameStatus.ONGOING);
        game.setStartedAt(java.time.LocalDateTime.now());
        game.setLastMoveTimestamp(System.currentTimeMillis());
        return gameRepo.save(game);
    }

    @Transactional
    public GameStateMessage processMove(Long gameId, Long userId, MoveRequest req) {
        Game game = gameRepo.findById(gameId).orElseThrow();
        User user = userRepo.findById(userId).orElseThrow();

        if (game.getStatus() != Game.GameStatus.ONGOING)
            throw new IllegalStateException("Game is not ongoing");

        ChessBoard board = ChessBoard.fromFen(game.getCurrentFen());
        Color currentTurn = board.getTurn();

        // Verify it's this user's turn
        boolean isWhiteTurn = currentTurn == Color.WHITE;
        User expectedPlayer = isWhiteTurn ? game.getWhitePlayer() : game.getBlackPlayer();
        if (expectedPlayer == null || !expectedPlayer.getId().equals(userId))
            throw new IllegalStateException("Not your turn");

        // Parse and validate move
        String from = req.getFrom(), to = req.getTo();
        int fromFile = from.charAt(0) - 'a', fromRank = from.charAt(1) - '1';
        int toFile   = to.charAt(0)   - 'a', toRank   = to.charAt(1)   - '1';

        PieceType promo = null;
        if (req.getPromotion() != null && !req.getPromotion().isEmpty()) {
            promo = switch (req.getPromotion()) {
                case "q" -> PieceType.QUEEN;
                case "r" -> PieceType.ROOK;
                case "b" -> PieceType.BISHOP;
                case "n" -> PieceType.KNIGHT;
                default  -> PieceType.QUEEN;
            };
        }

        ChessMove move = new ChessMove(fromRank, fromFile, toRank, toFile, promo);
        if (!ChessEngine.validateMove(board, move))
            throw new IllegalArgumentException("Illegal move: " + from + to);

        // Update timers
        long now = System.currentTimeMillis();
        if (game.getLastMoveTimestamp() != null) {
            long elapsed = now - game.getLastMoveTimestamp();
            if (isWhiteTurn) {
                long newTime = game.getWhiteTimeRemaining() - elapsed + game.getTimeControl().increment;
                if (newTime <= 0) {
                    return finishGame(game, "black", "TIMEOUT", "White ran out of time");
                }
                game.setWhiteTimeRemaining(newTime);
            } else {
                long newTime = game.getBlackTimeRemaining() - elapsed + game.getTimeControl().increment;
                if (newTime <= 0) {
                    return finishGame(game, "white", "TIMEOUT", "Black ran out of time");
                }
                game.setBlackTimeRemaining(newTime);
            }
        }
        game.setLastMoveTimestamp(now);

        // Generate SAN before applying move
        String san = ChessEngine.moveToSan(board, move);

        // Apply move
        board.makeMove(move);
        String newFen = board.toFen();
        game.setCurrentFen(newFen);

        // Update PGN
        int moveNum = (board.getFullMoveNumber() - (board.getTurn() == Color.WHITE ? 0 : 1));
        String pgnEntry = "";
        if (!isWhiteTurn) { // just completed black's move
            pgnEntry = " " + san;
        } else {
            pgnEntry = " " + moveNum + ". " + san;
        }
        game.setPgn(game.getPgn() + pgnEntry);

        // Save move record
        int totalMoves = (int) moveRepo.findByGameOrderByMoveNumberAsc(game).stream().count();
        GameMove gm = GameMove.builder()
                .game(game).moveNumber(totalMoves + 1)
                .uciMove(move.toUci()).san(san).fenAfter(newFen)
                .whiteTimeAfter(game.getWhiteTimeRemaining())
                .blackTimeAfter(game.getBlackTimeRemaining())
                .timestamp(now).build();
        moveRepo.save(gm);

        // Check game over
        String status = ChessEngine.getGameStatus(board);
        boolean gameOver = ChessEngine.isGameOver(board);

        if (gameOver) {
            String winner = null;
            String reason = status;
            Game.GameResult result = Game.GameResult.DRAW;
            if ("CHECKMATE".equals(status)) {
                winner = isWhiteTurn ? "white" : "black"; // the one who just moved
                result = isWhiteTurn ? Game.GameResult.WHITE_WINS : Game.GameResult.BLACK_WINS;
                reason = "Checkmate";
            } else if ("STALEMATE".equals(status)) {
                winner = "draw"; reason = "Stalemate";
            } else if ("FIFTY_MOVE_RULE".equals(status)) {
                winner = "draw"; reason = "50-move rule";
            } else if ("INSUFFICIENT_MATERIAL".equals(status)) {
                winner = "draw"; reason = "Insufficient material";
            }
            return finishGame(game, winner, status, reason);
        }

        gameRepo.save(game);

        List<String> legalMoves = ChessEngine.getLegalMoves(board).stream()
                .map(ChessMove::toUci).collect(Collectors.toList());

        return buildStateMessage(game, board, move.toUci(), status, legalMoves, 0, 0);
    }

    @Transactional
    public GameStateMessage processComputerMove(Long gameId) {
        Game game = gameRepo.findById(gameId).orElseThrow();
        if (game.getStatus() != Game.GameStatus.ONGOING || !game.isVsComputer())
            return null;

        ChessBoard board = ChessBoard.fromFen(game.getCurrentFen());
        List<ChessMove> legal = ChessEngine.getLegalMoves(board);
        if (legal.isEmpty()) return null;

        // Simple: pick random legal move (replace with Stockfish for stronger play)
        ChessMove move = legal.get(new Random().nextInt(legal.size()));
        String san = ChessEngine.moveToSan(board, move);
        boolean wasWhite = board.getTurn() == Color.WHITE;

        board.makeMove(move);
        game.setCurrentFen(board.toFen());

        int moveNum = board.getFullMoveNumber() - (board.getTurn() == Color.WHITE ? 0 : 1);
        String pgnEntry = wasWhite ? " " + moveNum + ". " + san : " " + san;
        game.setPgn(game.getPgn() + pgnEntry);

        int totalMoves = (int) moveRepo.findByGameOrderByMoveNumberAsc(game).stream().count();
        moveRepo.save(GameMove.builder()
                .game(game).moveNumber(totalMoves + 1)
                .uciMove(move.toUci()).san(san).fenAfter(board.toFen())
                .whiteTimeAfter(game.getWhiteTimeRemaining())
                .blackTimeAfter(game.getBlackTimeRemaining())
                .timestamp(System.currentTimeMillis()).build());

        String status = ChessEngine.getGameStatus(board);
        boolean gameOver = ChessEngine.isGameOver(board);

        if (gameOver) {
            String winner = null;
            String reason = status;
            if ("CHECKMATE".equals(status)) {
                winner = wasWhite ? "white" : "black";
                reason = "Checkmate";
            } else {
                winner = "draw";
                reason = status.replace("_", " ");
            }
            return finishGame(game, winner, status, reason);
        }

        gameRepo.save(game);
        List<String> legalMoves = ChessEngine.getLegalMoves(board).stream()
                .map(ChessMove::toUci).collect(Collectors.toList());
        return buildStateMessage(game, board, move.toUci(), status, legalMoves, 0, 0);
    }

    @Transactional
    public GameStateMessage resignGame(Long gameId, Long userId) {
        Game game = gameRepo.findById(gameId).orElseThrow();
        String winner = game.getWhitePlayer() != null && game.getWhitePlayer().getId().equals(userId)
                ? "black" : "white";
        return finishGame(game, winner, "RESIGNED", "Resigned");
    }

    @Transactional
    public GameStateMessage abortGame(Long gameId, Long userId) {
        Game game = gameRepo.findById(gameId).orElseThrow();
        game.setStatus(Game.GameStatus.ABANDONED);
        game.setEndedAt(java.time.LocalDateTime.now());
        gameRepo.save(game);
        ChessBoard board = ChessBoard.fromFen(game.getCurrentFen());
        return buildStateMessage(game, board, null, "ABANDONED", List.of(), 0, 0);
    }

    private GameStateMessage finishGame(Game game, String winner, String status, String reason) {
        game.setStatus(Game.GameStatus.FINISHED);
        game.setWinner(winner);
        game.setResultReason(reason);
        game.setEndedAt(java.time.LocalDateTime.now());

        int[] ratingChanges = {0, 0};
        if (game.getWhitePlayer() != null && game.getBlackPlayer() != null && !game.isVsComputer()) {
            Game.GameResult result = "white".equals(winner) ? Game.GameResult.WHITE_WINS
                    : "black".equals(winner) ? Game.GameResult.BLACK_WINS : Game.GameResult.DRAW;
            game.setResult(result);
            ratingChanges = eloService.updateRatings(game.getWhitePlayer(), game.getBlackPlayer(),
                    result, game.getTimeControl());
            updateStats(game.getWhitePlayer(), result == Game.GameResult.WHITE_WINS,
                    result == Game.GameResult.BLACK_WINS, result == Game.GameResult.DRAW);
            updateStats(game.getBlackPlayer(), result == Game.GameResult.BLACK_WINS,
                    result == Game.GameResult.WHITE_WINS, result == Game.GameResult.DRAW);
        }

        gameRepo.save(game);
        ChessBoard board = ChessBoard.fromFen(game.getCurrentFen());
        return buildStateMessage(game, board, null, status, List.of(), ratingChanges[0], ratingChanges[1]);
    }

    private void updateStats(User user, boolean won, boolean lost, boolean draw) {
        user.setGamesPlayed(user.getGamesPlayed() + 1);
        if (won)  user.setGamesWon(user.getGamesWon() + 1);
        if (lost) user.setGamesLost(user.getGamesLost() + 1);
        if (draw) user.setGamesDraw(user.getGamesDraw() + 1);
        userRepo.save(user);
    }

    private GameStateMessage buildStateMessage(Game game, ChessBoard board, String lastMove,
                                                String status, List<String> legalMoves,
                                                int whiteChange, int blackChange) {
        User wp = game.getWhitePlayer(), bp = game.getBlackPlayer();
        return GameStateMessage.builder()
                .type("GAME_UPDATE")
                .gameId(game.getId())
                .fen(board.toFen())
                .pgn(game.getPgn())
                .lastMove(lastMove)
                .status(status)
                .turn(board.getTurn() == Color.WHITE ? "white" : "black")
                .whiteTime(game.getWhiteTimeRemaining())
                .blackTime(game.getBlackTimeRemaining())
                .winner(game.getWinner())
                .resultReason(game.getResultReason())
                .whitePlayer(wp != null ? wp.getUsername() : "Computer")
                .blackPlayer(bp != null ? bp.getUsername() : "Computer")
                .whiteRating(wp != null ? wp.getBlitzRating() : 1500)
                .blackRating(bp != null ? bp.getBlitzRating() : 1500)
                .whiteRatingChange(whiteChange)
                .blackRatingChange(blackChange)
                .legalMoves(legalMoves)
                .isInCheck(ChessEngine.isInCheck(board, board.getTurn()))
                .build();
    }

    public Game getGame(Long gameId) {
        return gameRepo.findById(gameId).orElseThrow();
    }

    public List<Game> getGameHistory(String username) {
        User user = userService.getByUsername(username);
        return gameRepo.findByPlayer(user);
    }
}
