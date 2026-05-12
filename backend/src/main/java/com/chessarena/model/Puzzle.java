package com.chessarena.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "puzzle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Puzzle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fen;

    @Column(nullable = false)
    private String solutionMoves; // space-separated UCI moves

    @Builder.Default private int rating = 1200;

    @Enumerated(EnumType.STRING)
    private PuzzleCategory category;

    private String title;
    private String description;

    @Builder.Default private int timesAttempted = 0;
    @Builder.Default private int timesSolved    = 0;

    public enum PuzzleCategory {
        TACTICS, ENDGAME, OPENING, MATING_NET, FORK, PIN, SKEWER, DISCOVERED_ATTACK, BACK_RANK
    }
}