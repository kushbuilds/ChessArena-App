package com.chessarena.chess;

import java.util.Arrays;

public class ChessBoard {

    private Piece[][] squares = new Piece[8][8];
    private Color turn = Color.WHITE;
    private boolean[] castlingRights = {true, true, true, true};
    private int[] enPassantTarget = null;
    private int halfMoveClock = 0;
    private int fullMoveNumber = 1;

    public ChessBoard() {}

    public Piece getPiece(int rank, int file) { return squares[rank][file]; }
    public void setPiece(int rank, int file, Piece piece) { squares[rank][file] = piece; }
    public Color getTurn() { return turn; }
    public void setTurn(Color turn) { this.turn = turn; }
    public boolean[] getCastlingRights() { return castlingRights; }
    public int[] getEnPassantTarget() { return enPassantTarget; }
    public int getHalfMoveClock() { return halfMoveClock; }
    public int getFullMoveNumber() { return fullMoveNumber; }

    public boolean isOccupied(int rank, int file) {
        return inBounds(rank, file) && squares[rank][file] != null;
    }

    public boolean inBounds(int rank, int file) {
        return rank >= 0 && rank < 8 && file >= 0 && file < 8;
    }

    public static ChessBoard initialPosition() {
        return fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }

    public static ChessBoard fromFen(String fen) {
        ChessBoard board = new ChessBoard();
        String[] parts = fen.trim().split("\\s+");

        String[] rows = parts[0].split("/");
        for (int fenRow = 0; fenRow < 8; fenRow++) {
            int rank = 7 - fenRow;
            int file = 0;
            for (char c : rows[fenRow].toCharArray()) {
                if (Character.isDigit(c)) {
                    file += c - '0';
                } else {
                    board.squares[rank][file] = Piece.fromChar(c);
                    file++;
                }
            }
        }

        if (parts.length > 1) board.turn = parts[1].equals("b") ? Color.BLACK : Color.WHITE;

        Arrays.fill(board.castlingRights, false);
        if (parts.length > 2 && !parts[2].equals("-")) {
            for (char c : parts[2].toCharArray()) {
                switch (c) {
                    case 'K' -> board.castlingRights[0] = true;
                    case 'Q' -> board.castlingRights[1] = true;
                    case 'k' -> board.castlingRights[2] = true;
                    case 'q' -> board.castlingRights[3] = true;
                }
            }
        }

        if (parts.length > 3 && !parts[3].equals("-")) {
            int epFile = parts[3].charAt(0) - 'a';
            int epRank = parts[3].charAt(1) - '1';
            board.enPassantTarget = new int[]{epRank, epFile};
        }

        if (parts.length > 4) board.halfMoveClock = Integer.parseInt(parts[4]);
        if (parts.length > 5) board.fullMoveNumber = Integer.parseInt(parts[5]);

        return board;
    }

    public String toFen() {
        StringBuilder sb = new StringBuilder();
        for (int fenRow = 0; fenRow < 8; fenRow++) {
            int rank = 7 - fenRow;
            int empty = 0;
            for (int file = 0; file < 8; file++) {
                Piece p = squares[rank][file];
                if (p == null) {
                    empty++;
                } else {
                    if (empty > 0) { sb.append(empty); empty = 0; }
                    sb.append(p.toChar());
                }
            }
            if (empty > 0) sb.append(empty);
            if (fenRow < 7) sb.append('/');
        }

        sb.append(' ').append(turn == Color.WHITE ? 'w' : 'b');

        sb.append(' ');
        StringBuilder cr = new StringBuilder();
        if (castlingRights[0]) cr.append('K');
        if (castlingRights[1]) cr.append('Q');
        if (castlingRights[2]) cr.append('k');
        if (castlingRights[3]) cr.append('q');
        sb.append(cr.length() == 0 ? "-" : cr);

        sb.append(' ');
        if (enPassantTarget == null) {
            sb.append('-');
        } else {
            sb.append((char) ('a' + enPassantTarget[1]));
            sb.append(enPassantTarget[0] + 1);
        }

        sb.append(' ').append(halfMoveClock);
        sb.append(' ').append(fullMoveNumber);
        return sb.toString();
    }

    public ChessBoard clone() {
        ChessBoard copy = new ChessBoard();
        for (int r = 0; r < 8; r++) copy.squares[r] = Arrays.copyOf(squares[r], 8);
        copy.turn = this.turn;
        copy.castlingRights = Arrays.copyOf(this.castlingRights, 4);
        copy.enPassantTarget = this.enPassantTarget == null ? null : Arrays.copyOf(this.enPassantTarget, 2);
        copy.halfMoveClock = this.halfMoveClock;
        copy.fullMoveNumber = this.fullMoveNumber;
        return copy;
    }

    public void makeMove(ChessMove move) {
        int fromR = move.getFromRank(), fromF = move.getFromFile();
        int toR   = move.getToRank(),   toF   = move.getToFile();
        Piece piece    = squares[fromR][fromF];
        Piece captured = squares[toR][toF];

        boolean isPawnMove = piece != null && piece.type() == PieceType.PAWN;

        boolean isEnPassantCapture = isPawnMove && enPassantTarget != null
                && toR == enPassantTarget[0] && toF == enPassantTarget[1] && captured == null;
        if (isEnPassantCapture) {
            squares[fromR][toF] = null;
        }

        boolean isCastle = piece != null && piece.type() == PieceType.KING && Math.abs(toF - fromF) == 2;
        if (isCastle) {
            if (toF > fromF) {
                squares[fromR][5] = squares[fromR][7];
                squares[fromR][7] = null;
            } else {
                squares[fromR][3] = squares[fromR][0];
                squares[fromR][0] = null;
            }
        }

        squares[toR][toF]     = piece;
        squares[fromR][fromF] = null;

        if (isPawnMove && (toR == 7 || toR == 0)) {
            PieceType promoType = move.getPromotion() != null ? move.getPromotion() : PieceType.QUEEN;
            squares[toR][toF] = new Piece(promoType, piece.color());
        }

        if (piece != null && piece.type() == PieceType.KING) {
            if (piece.color() == Color.WHITE) { castlingRights[0] = false; castlingRights[1] = false; }
            else                              { castlingRights[2] = false; castlingRights[3] = false; }
        }
        if (piece != null && piece.type() == PieceType.ROOK) {
            if (fromR == 0 && fromF == 7) castlingRights[0] = false;
            if (fromR == 0 && fromF == 0) castlingRights[1] = false;
            if (fromR == 7 && fromF == 7) castlingRights[2] = false;
            if (fromR == 7 && fromF == 0) castlingRights[3] = false;
        }
        if (toR == 0 && toF == 7) castlingRights[0] = false;
        if (toR == 0 && toF == 0) castlingRights[1] = false;
        if (toR == 7 && toF == 7) castlingRights[2] = false;
        if (toR == 7 && toF == 0) castlingRights[3] = false;

        enPassantTarget = null;
        if (isPawnMove && Math.abs(toR - fromR) == 2) {
            enPassantTarget = new int[]{(fromR + toR) / 2, toF};
        }

        if (isPawnMove || captured != null || isEnPassantCapture) {
            halfMoveClock = 0;
        } else {
            halfMoveClock++;
        }

        if (turn == Color.BLACK) fullMoveNumber++;
        turn = turn.opposite();
    }

    public int[] findKing(Color color) {
        for (int r = 0; r < 8; r++)
            for (int f = 0; f < 8; f++) {
                Piece p = squares[r][f];
                if (p != null && p.type() == PieceType.KING && p.color() == color)
                    return new int[]{r, f};
            }
        return null;
    }
}