package com.chessarena.chess;

public record Piece(PieceType type, Color color) {

    public char toChar() {
        char c = switch (type) {
            case KING   -> 'K';
            case QUEEN  -> 'Q';
            case ROOK   -> 'R';
            case BISHOP -> 'B';
            case KNIGHT -> 'N';
            case PAWN   -> 'P';
        };
        return color == Color.WHITE ? c : Character.toLowerCase(c);
    }

    public static Piece fromChar(char c) {
        Color color = Character.isUpperCase(c) ? Color.WHITE : Color.BLACK;
        PieceType type = switch (Character.toUpperCase(c)) {
            case 'K' -> PieceType.KING;
            case 'Q' -> PieceType.QUEEN;
            case 'R' -> PieceType.ROOK;
            case 'B' -> PieceType.BISHOP;
            case 'N' -> PieceType.KNIGHT;
            case 'P' -> PieceType.PAWN;
            default  -> throw new IllegalArgumentException("Unknown piece: " + c);
        };
        return new Piece(type, color);
    }
}