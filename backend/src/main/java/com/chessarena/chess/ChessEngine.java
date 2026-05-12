package com.chessarena.chess;

import java.util.ArrayList;
import java.util.List;

public class ChessEngine {

    public static List<ChessMove> getLegalMoves(ChessBoard board) {
        List<ChessMove> pseudo = generatePseudoLegalMoves(board);
        List<ChessMove> legal  = new ArrayList<>();
        Color current = board.getTurn();
        for (ChessMove move : pseudo) {
            ChessBoard copy = board.clone();
            copy.makeMove(move);
            if (!isInCheck(copy, current)) legal.add(move);
        }
        return legal;
    }

    public static boolean isInCheck(ChessBoard board, Color color) {
        int[] king = board.findKing(color);
        if (king == null) return false;
        return isSquareAttackedBy(board, king[0], king[1], color.opposite());
    }

    public static boolean isCheckmate(ChessBoard board) {
        return isInCheck(board, board.getTurn()) && getLegalMoves(board).isEmpty();
    }

    public static boolean isStalemate(ChessBoard board) {
        return !isInCheck(board, board.getTurn()) && getLegalMoves(board).isEmpty();
    }

    public static boolean isFiftyMoveRule(ChessBoard board) {
        return board.getHalfMoveClock() >= 100;
    }

    public static boolean isInsufficientMaterial(ChessBoard board) {
        List<Piece> whites = new ArrayList<>(), blacks = new ArrayList<>();
        for (int r = 0; r < 8; r++)
            for (int f = 0; f < 8; f++) {
                Piece p = board.getPiece(r, f);
                if (p == null) continue;
                if (p.color() == Color.WHITE) whites.add(p);
                else blacks.add(p);
            }
        if (whites.size() == 1 && blacks.size() == 1) return true; // K vs K
        if (whites.size() == 1 && blacks.size() == 2) {
            PieceType t = blacks.get(0).type() == PieceType.KING ? blacks.get(1).type() : blacks.get(0).type();
            return t == PieceType.BISHOP || t == PieceType.KNIGHT;
        }
        if (blacks.size() == 1 && whites.size() == 2) {
            PieceType t = whites.get(0).type() == PieceType.KING ? whites.get(1).type() : whites.get(0).type();
            return t == PieceType.BISHOP || t == PieceType.KNIGHT;
        }
        return false;
    }

    public static boolean isDraw(ChessBoard board) {
        return isStalemate(board) || isFiftyMoveRule(board) || isInsufficientMaterial(board);
    }

    public static boolean isGameOver(ChessBoard board) {
        return isCheckmate(board) || isDraw(board);
    }

    public static String getGameStatus(ChessBoard board) {
        if (isCheckmate(board)) return "CHECKMATE";
        if (isStalemate(board)) return "STALEMATE";
        if (isFiftyMoveRule(board)) return "FIFTY_MOVE_RULE";
        if (isInsufficientMaterial(board)) return "INSUFFICIENT_MATERIAL";
        if (isInCheck(board, board.getTurn())) return "IN_CHECK";
        return "ONGOING";
    }

    public static boolean validateMove(ChessBoard board, ChessMove move) {
        List<ChessMove> legal = getLegalMoves(board);
        return legal.stream().anyMatch(m ->
                m.getFromRank() == move.getFromRank() &&
                m.getFromFile() == move.getFromFile() &&
                m.getToRank()   == move.getToRank()   &&
                m.getToFile()   == move.getToFile()   &&
                (move.getPromotion() == null || m.getPromotion() == move.getPromotion()));
    }

    public static boolean isSquareAttackedBy(ChessBoard board, int rank, int file, Color attacker) {
        // Pawn attacks
        int pawnDir = attacker == Color.WHITE ? -1 : 1;
        int pawnRank = rank + pawnDir;
        if (board.inBounds(pawnRank, file - 1)) {
            Piece p = board.getPiece(pawnRank, file - 1);
            if (p != null && p.color() == attacker && p.type() == PieceType.PAWN) return true;
        }
        if (board.inBounds(pawnRank, file + 1)) {
            Piece p = board.getPiece(pawnRank, file + 1);
            if (p != null && p.color() == attacker && p.type() == PieceType.PAWN) return true;
        }

        // Knight attacks
        int[][] knightOffsets = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
        for (int[] off : knightOffsets) {
            int r = rank + off[0], f = file + off[1];
            if (board.inBounds(r, f)) {
                Piece p = board.getPiece(r, f);
                if (p != null && p.color() == attacker && p.type() == PieceType.KNIGHT) return true;
            }
        }

        // Diagonal attacks (bishop / queen)
        int[][] diags = {{1,1},{1,-1},{-1,1},{-1,-1}};
        for (int[] dir : diags) {
            int r = rank + dir[0], f = file + dir[1];
            while (board.inBounds(r, f)) {
                Piece p = board.getPiece(r, f);
                if (p != null) {
                    if (p.color() == attacker && (p.type() == PieceType.BISHOP || p.type() == PieceType.QUEEN))
                        return true;
                    break;
                }
                r += dir[0]; f += dir[1];
            }
        }

        // Straight attacks (rook / queen)
        int[][] straights = {{1,0},{-1,0},{0,1},{0,-1}};
        for (int[] dir : straights) {
            int r = rank + dir[0], f = file + dir[1];
            while (board.inBounds(r, f)) {
                Piece p = board.getPiece(r, f);
                if (p != null) {
                    if (p.color() == attacker && (p.type() == PieceType.ROOK || p.type() == PieceType.QUEEN))
                        return true;
                    break;
                }
                r += dir[0]; f += dir[1];
            }
        }

        // King attacks
        for (int dr = -1; dr <= 1; dr++)
            for (int df = -1; df <= 1; df++) {
                if (dr == 0 && df == 0) continue;
                int r = rank + dr, f = file + df;
                if (board.inBounds(r, f)) {
                    Piece p = board.getPiece(r, f);
                    if (p != null && p.color() == attacker && p.type() == PieceType.KING) return true;
                }
            }

        return false;
    }

    private static List<ChessMove> generatePseudoLegalMoves(ChessBoard board) {
        List<ChessMove> moves = new ArrayList<>();
        Color color = board.getTurn();
        for (int r = 0; r < 8; r++)
            for (int f = 0; f < 8; f++) {
                Piece p = board.getPiece(r, f);
                if (p == null || p.color() != color) continue;
                switch (p.type()) {
                    case PAWN   -> generatePawnMoves(board, r, f, color, moves);
                    case KNIGHT -> generateKnightMoves(board, r, f, color, moves);
                    case BISHOP -> generateSlidingMoves(board, r, f, color, moves, new int[][]{{1,1},{1,-1},{-1,1},{-1,-1}});
                    case ROOK   -> generateSlidingMoves(board, r, f, color, moves, new int[][]{{1,0},{-1,0},{0,1},{0,-1}});
                    case QUEEN  -> { generateSlidingMoves(board, r, f, color, moves, new int[][]{{1,1},{1,-1},{-1,1},{-1,-1}});
                                     generateSlidingMoves(board, r, f, color, moves, new int[][]{{1,0},{-1,0},{0,1},{0,-1}}); }
                    case KING   -> generateKingMoves(board, r, f, color, moves);
                }
            }
        return moves;
    }

    private static void generatePawnMoves(ChessBoard board, int r, int f, Color color, List<ChessMove> moves) {
        int dir     = color == Color.WHITE ? 1 : -1;
        int startR  = color == Color.WHITE ? 1 : 6;
        int promoR  = color == Color.WHITE ? 7 : 0;

        // Forward one
        int r1 = r + dir;
        if (board.inBounds(r1, f) && board.getPiece(r1, f) == null) {
            addPawnMove(r, f, r1, f, r1 == promoR, moves);
            // Forward two from starting rank
            int r2 = r + 2 * dir;
            if (r == startR && board.inBounds(r2, f) && board.getPiece(r2, f) == null) {
                moves.add(new ChessMove(r, f, r2, f));
            }
        }

        // Diagonal captures
        for (int df : new int[]{-1, 1}) {
            int cf = f + df;
            if (!board.inBounds(r1, cf)) continue;
            Piece target = board.getPiece(r1, cf);
            boolean isCapture = target != null && target.color() != color;
            int[] ep = board.getEnPassantTarget();
            boolean isEP = ep != null && r1 == ep[0] && cf == ep[1];
            if (isCapture || isEP) {
                addPawnMove(r, f, r1, cf, r1 == promoR, moves);
            }
        }
    }

    private static void addPawnMove(int fromR, int fromF, int toR, int toF, boolean isPromo, List<ChessMove> moves) {
        if (isPromo) {
            for (PieceType pt : new PieceType[]{PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT}) {
                moves.add(new ChessMove(fromR, fromF, toR, toF, pt));
            }
        } else {
            moves.add(new ChessMove(fromR, fromF, toR, toF));
        }
    }

    private static void generateKnightMoves(ChessBoard board, int r, int f, Color color, List<ChessMove> moves) {
        int[][] offsets = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
        for (int[] off : offsets) {
            int tr = r + off[0], tf = f + off[1];
            if (!board.inBounds(tr, tf)) continue;
            Piece target = board.getPiece(tr, tf);
            if (target == null || target.color() != color) moves.add(new ChessMove(r, f, tr, tf));
        }
    }

    private static void generateSlidingMoves(ChessBoard board, int r, int f, Color color, List<ChessMove> moves, int[][] dirs) {
        for (int[] dir : dirs) {
            int tr = r + dir[0], tf = f + dir[1];
            while (board.inBounds(tr, tf)) {
                Piece target = board.getPiece(tr, tf);
                if (target == null) {
                    moves.add(new ChessMove(r, f, tr, tf));
                } else {
                    if (target.color() != color) moves.add(new ChessMove(r, f, tr, tf));
                    break;
                }
                tr += dir[0]; tf += dir[1];
            }
        }
    }

    private static void generateKingMoves(ChessBoard board, int r, int f, Color color, List<ChessMove> moves) {
        for (int dr = -1; dr <= 1; dr++)
            for (int df = -1; df <= 1; df++) {
                if (dr == 0 && df == 0) continue;
                int tr = r + dr, tf = f + df;
                if (!board.inBounds(tr, tf)) continue;
                Piece target = board.getPiece(tr, tf);
                if (target == null || target.color() != color) moves.add(new ChessMove(r, f, tr, tf));
            }

        // Castling
        boolean[] cr = board.getCastlingRights();
        if (!isInCheck(board, color)) {
            int backRank = color == Color.WHITE ? 0 : 7;
            int ksIdx = color == Color.WHITE ? 0 : 2;
            int qsIdx = color == Color.WHITE ? 1 : 3;
            // Kingside
            if (cr[ksIdx]
                    && board.getPiece(backRank, 5) == null
                    && board.getPiece(backRank, 6) == null
                    && !isSquareAttackedBy(board, backRank, 5, color.opposite())
                    && !isSquareAttackedBy(board, backRank, 6, color.opposite())) {
                moves.add(new ChessMove(backRank, 4, backRank, 6));
            }
            // Queenside
            if (cr[qsIdx]
                    && board.getPiece(backRank, 3) == null
                    && board.getPiece(backRank, 2) == null
                    && board.getPiece(backRank, 1) == null
                    && !isSquareAttackedBy(board, backRank, 3, color.opposite())
                    && !isSquareAttackedBy(board, backRank, 2, color.opposite())) {
                moves.add(new ChessMove(backRank, 4, backRank, 2));
            }
        }
    }

    public static String moveToSan(ChessBoard boardBefore, ChessMove move) {
        Piece piece = boardBefore.getPiece(move.getFromRank(), move.getFromFile());
        if (piece == null) return move.toUci();

        ChessBoard after = boardBefore.clone();
        after.makeMove(move);
        boolean isCheck = isInCheck(after, after.getTurn());
        boolean isMate  = isCheck && isCheckmate(after);
        String suffix   = isMate ? "#" : isCheck ? "+" : "";

        // Castling
        if (piece.type() == PieceType.KING && Math.abs(move.getToFile() - move.getFromFile()) == 2) {
            return (move.getToFile() > move.getFromFile() ? "O-O" : "O-O-O") + suffix;
        }

        StringBuilder sb = new StringBuilder();
        char toFileChar = (char) ('a' + move.getToFile());
        char toRankChar = (char) ('1' + move.getToRank());

        if (piece.type() == PieceType.PAWN) {
            boolean isCapture = boardBefore.getPiece(move.getToRank(), move.getToFile()) != null
                    || (boardBefore.getEnPassantTarget() != null
                        && move.getToRank() == boardBefore.getEnPassantTarget()[0]
                        && move.getToFile() == boardBefore.getEnPassantTarget()[1]);
            if (isCapture) sb.append((char)('a' + move.getFromFile())).append('x');
            sb.append(toFileChar).append(toRankChar);
            if (move.getPromotion() != null) {
                sb.append('=').append(Character.toUpperCase(new Piece(move.getPromotion(), Color.WHITE).toChar()));
            }
        } else {
            sb.append(Character.toUpperCase(piece.toChar()));
            // Disambiguation
            List<ChessMove> legal = getLegalMoves(boardBefore);
            boolean fileDisamb = false, rankDisamb = false;
            for (ChessMove m : legal) {
                if (m.getToRank() == move.getToRank() && m.getToFile() == move.getToFile()
                        && m.getFromRank() == move.getFromRank() && m.getFromFile() == move.getFromFile()) continue;
                Piece other = boardBefore.getPiece(m.getFromRank(), m.getFromFile());
                if (other != null && other.type() == piece.type()
                        && m.getToRank() == move.getToRank() && m.getToFile() == move.getToFile()) {
                    if (m.getFromFile() != move.getFromFile()) fileDisamb = true;
                    else rankDisamb = true;
                }
            }
            if (fileDisamb) sb.append((char)('a' + move.getFromFile()));
            else if (rankDisamb) sb.append((char)('1' + move.getFromRank()));
            if (boardBefore.getPiece(move.getToRank(), move.getToFile()) != null) sb.append('x');
            sb.append(toFileChar).append(toRankChar);
        }
        sb.append(suffix);
        return sb.toString();
    }
}