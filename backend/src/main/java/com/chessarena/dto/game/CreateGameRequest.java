package com.chessarena.dto.game;

import lombok.Data;

@Data
public class CreateGameRequest {
    private String  timeControl;   // "BLITZ_5" etc.
    private boolean vsComputer;
    private int     computerLevel; // 1-20
    private String  color;         // "white","black","random"
}
