package com.chessarena.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Builder.Default private int bulletRating    = 1200;
    @Builder.Default private int blitzRating     = 1200;
    @Builder.Default private int rapidRating     = 1200;
    @Builder.Default private int classicalRating = 1200;
    @Builder.Default private int puzzleRating    = 1200;

    @Builder.Default private int gamesPlayed  = 0;
    @Builder.Default private int gamesWon     = 0;
    @Builder.Default private int gamesLost    = 0;
    @Builder.Default private int gamesDraw    = 0;
    @Builder.Default private int puzzlesSolved = 0;

    private String country;
    private String bio;
    private String avatarUrl;

    @Builder.Default private boolean isOnline = false;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime lastSeen;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>(Set.of("ROLE_USER"));
}