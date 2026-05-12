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
        TACTICS, ENDGAME, OPENING, MATING_NET, FORK, KNIGHT_FORK, PIN, ABSOLUTE_PIN, SKEWER,
        DISCOVERED_ATTACK, BACK_RANK, DOUBLE_CHECK, DEFLECTION, DECOY, OVERLOADING,
        ZWISCHENZUG, X_RAY, TRAPPED_PIECE, REMOVING_THE_DEFENDER, CLEARANCE, INTERFERENCE,
        WINDMILL, SMOTHERED_MATE, GREEK_GIFT, ATTRACTION, KING_EXTRACTION, SACRIFICE,
        COUNTER_THREAT, ZUGZWANG, SIMPLIFICATION, STALEMATE, LINEAR_MATE
    }
}