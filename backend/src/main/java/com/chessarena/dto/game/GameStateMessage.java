package com.chessarena.dto.game;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GameStateMessage {
    private String       type;
    private Long         gameId;
    private String       fen;
    private String       pgn;
    private String       lastMove;
    private String       status;
    private String       turn;
    private long         whiteTime;
    private long         blackTime;
    private String       winner;
    private String       resultReason;
    private String       whitePlayer;
    private String       blackPlayer;
    private int          whiteRating;
    private int          blackRating;
    private int          whiteRatingChange;
    private int          blackRatingChange;
    private List<String> legalMoves;
    private boolean      isInCheck;
    private String       message;
    private String       senderUsername;
}
