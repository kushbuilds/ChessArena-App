package com.chessarena.chess;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChessMove {
    private int fromRank;
    private int fromFile;
    private int toRank;
    private int toFile;
    private PieceType promotion;

    public ChessMove(int fromRank, int fromFile, int toRank, int toFile) {
        this.fromRank = fromRank;
        this.fromFile = fromFile;
        this.toRank = toRank;
        this.toFile = toFile;
    }

    public String toUci() {
        String from = "" + (char) ('a' + fromFile) + (fromRank + 1);
        String to   = "" + (char) ('a' + toFile)   + (toRank + 1);
        String promo = promotion == null ? "" : switch (promotion) {
            case QUEEN  -> "q";
            case ROOK   -> "r";
            case BISHOP -> "b";
            case KNIGHT -> "n";
            default     -> "";
        };
        return from + to + promo;
    }

    public static ChessMove fromUci(String uci) {
        if (uci == null || uci.length() < 4) throw new IllegalArgumentException("Invalid UCI: " + uci);
        int fromFile = uci.charAt(0) - 'a';
        int fromRank = uci.charAt(1) - '1';
        int toFile   = uci.charAt(2) - 'a';
        int toRank   = uci.charAt(3) - '1';
        PieceType promo = null;
        if (uci.length() == 5) {
            promo = switch (uci.charAt(4)) {
                case 'q' -> PieceType.QUEEN;
                case 'r' -> PieceType.ROOK;
                case 'b' -> PieceType.BISHOP;
                case 'n' -> PieceType.KNIGHT;
                default  -> null;
            };
        }
        return new ChessMove(fromRank, fromFile, toRank, toFile, promo);
    }
}