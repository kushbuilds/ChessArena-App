package com.chessarena.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "game_moves")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameMove {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

    private int    moveNumber;
    private String uciMove;
    private String san;
    private String fenAfter;
    private long   whiteTimeAfter;
    private long   blackTimeAfter;
    private Long   timestamp;
}