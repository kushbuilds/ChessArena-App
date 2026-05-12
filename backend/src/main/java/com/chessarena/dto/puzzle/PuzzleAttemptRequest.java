package com.chessarena.dto.puzzle;

import lombok.Data;

@Data
public class PuzzleAttemptRequest {
    private Long   puzzleId;
    private String moves;           // space-separated UCI moves
    private int    timeSpentSeconds;
}
