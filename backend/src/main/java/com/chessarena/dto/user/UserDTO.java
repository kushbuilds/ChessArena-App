package com.chessarena.dto.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private Long    id;
    private String  username;
    private String  avatarUrl;
    private int     blitzRating;
    private boolean isOnline;
    private String  country;
}
