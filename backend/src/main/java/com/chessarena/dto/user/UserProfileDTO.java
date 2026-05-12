package com.chessarena.dto.user;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileDTO {
    private Long          id;
    private String        username;
    private String        email;
    private String        bio;
    private String        country;
    private String        avatarUrl;
    private int           bulletRating;
    private int           blitzRating;
    private int           rapidRating;
    private int           classicalRating;
    private int           puzzleRating;
    private int           gamesPlayed;
    private int           gamesWon;
    private int           gamesLost;
    private int           gamesDraw;
    private int           puzzlesSolved;
    private boolean       isOnline;
    private LocalDateTime createdAt;
    private LocalDateTime lastSeen;
}
