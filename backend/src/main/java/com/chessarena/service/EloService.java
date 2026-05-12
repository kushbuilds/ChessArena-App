package com.chessarena.service;

import com.chessarena.model.Game;
import com.chessarena.model.User;
import com.chessarena.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EloService {

    private static final int K = 32;
    private final UserRepository userRepository;

    public int[] calculateNewRatings(int white, int black, double result) {
        double expWhite = 1.0 / (1 + Math.pow(10, (black - white) / 400.0));
        int newWhite = (int) Math.round(white + K * (result - expWhite));
        int newBlack = (int) Math.round(black + K * ((1 - result) - (1 - expWhite)));
        return new int[]{Math.max(100, newWhite), Math.max(100, newBlack)};
    }

    public int[] updateRatings(User white, User black, Game.GameResult result, Game.TimeControl tc) {
        double score = result == Game.GameResult.WHITE_WINS ? 1.0
                     : result == Game.GameResult.BLACK_WINS ? 0.0 : 0.5;

        int wBefore = getRating(white, tc);
        int bBefore = getRating(black, tc);
        int[] newRatings = calculateNewRatings(wBefore, bBefore, score);

        setRating(white, tc, newRatings[0]);
        setRating(black, tc, newRatings[1]);
        userRepository.save(white);
        userRepository.save(black);

        return new int[]{newRatings[0] - wBefore, newRatings[1] - bBefore};
    }

    private int getRating(User u, Game.TimeControl tc) {
        long base = tc.baseTime;
        if (base <= 120000)  return u.getBulletRating();
        if (base <= 300000)  return u.getBlitzRating();
        if (base <= 900000)  return u.getRapidRating();
        return u.getClassicalRating();
    }

    private void setRating(User u, Game.TimeControl tc, int rating) {
        long base = tc.baseTime;
        if (base <= 120000)  u.setBulletRating(rating);
        else if (base <= 300000) u.setBlitzRating(rating);
        else if (base <= 900000) u.setRapidRating(rating);
        else u.setClassicalRating(rating);
    }
}
