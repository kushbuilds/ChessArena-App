package com.chessarena.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "puzzle_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PuzzleAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "puzzle_id")
    private Puzzle puzzle;

    private boolean solved;
    private int     timeSpentSeconds;

    @Builder.Default
    private LocalDateTime attemptedAt = LocalDateTime.now();
}