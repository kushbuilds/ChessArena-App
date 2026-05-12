package com.chessarena.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "games")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "white_player_id")
    private User whitePlayer;

    @ManyToOne
    @JoinColumn(name = "black_player_id")
    private User blackPlayer;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GameStatus status = GameStatus.WAITING;

    @Enumerated(EnumType.STRING)
    private GameResult result;

    private String winner;      // "white" | "black" | "draw"
    private String resultReason;

    @Builder.Default
    private String currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String pgn = "";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TimeControl timeControl = TimeControl.BLITZ_5;

    @Builder.Default private long whiteTimeRemaining = 300000L;
    @Builder.Default private long blackTimeRemaining = 300000L;

    private Long lastMoveTimestamp;

    @Builder.Default private boolean isVsComputer  = false;
    @Builder.Default private int     computerLevel = 10;

    private boolean drawOfferedByWhite;
    private boolean drawOfferedByBlack;

    @Builder.Default private LocalDateTime createdAt  = LocalDateTime.now();
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<GameMove> moves = new ArrayList<>();

    public enum GameStatus  { WAITING, ONGOING, FINISHED, ABANDONED }
    public enum GameResult  { WHITE_WINS, BLACK_WINS, DRAW }

    public enum TimeControl {
        BULLET_1   (60000,   0,     "1+0"),
        BULLET_2   (120000,  1000,  "2+1"),
        BLITZ_3    (180000,  0,     "3+0"),
        BLITZ_3_2  (180000,  2000,  "3+2"),
        BLITZ_5    (300000,  0,     "5+0"),
        BLITZ_5_5  (300000,  5000,  "5+5"),
        RAPID_10   (600000,  0,     "10+0"),
        RAPID_15_10(900000,  10000, "15+10"),
        CLASSICAL_30(1800000,0,     "30+0");

        public final long   baseTime;
        public final long   increment;
        public final String label;

        TimeControl(long baseTime, long increment, String label) {
            this.baseTime  = baseTime;
            this.increment = increment;
            this.label     = label;
        }
    }
}