package com.chessarena.dto.puzzle;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PuzzleDTO {
    private Long   id;
    private String fen;
    private int    rating;
    private String category;
    private String title;
    private String description;
    private int    timesAttempted;
    private int    timesSolved;
}
