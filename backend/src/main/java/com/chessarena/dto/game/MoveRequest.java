package com.chessarena.dto.game;

import lombok.Data;

@Data
public class MoveRequest {
    private Long   gameId;
    private String from;       // e.g. "e2"
    private String to;         // e.g. "e4"
    private String promotion;  // "q","r","b","n" or null
}
