import React, { useState, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { GameStatus } from '../../types'

interface Props {
  fen: string
  onMove: (from: string, to: string, promotion?: string) => boolean
  orientation: 'white' | 'black'
  legalMoves: string[]
  lastMove: string | null
  isInCheck: boolean
  gameStatus: GameStatus
  isPlayerTurn: boolean
}

const BOARD_LIGHT = '#EEEED2'
const BOARD_DARK  = '#769656'

function getSquareFromUci(uci: string): { from: string; to: string } {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) }
}

export default function ChessBoard({ fen, onMove, orientation, legalMoves, lastMove, isInCheck, gameStatus, isPlayerTurn }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [promoMove, setPromoMove] = useState<{ from: string; to: string } | null>(null)

  const chess = new Chess(fen)

  const isOver = ['CHECKMATE','STALEMATE','DRAW','RESIGNED','TIMEOUT','DRAW_AGREED',
    'INSUFFICIENT_MATERIAL','FIFTY_MOVE_RULE','ABANDONED'].includes(gameStatus)

  // Build square styles
  const customSquareStyles: Record<string, React.CSSProperties> = {}

  // Highlight last move
  if (lastMove && lastMove.length >= 4) {
    const { from, to } = getSquareFromUci(lastMove)
    const style = { backgroundColor: 'rgba(245, 246, 130, 0.4)' }
    customSquareStyles[from] = style
    customSquareStyles[to]   = style
  }

  // Highlight selected piece legal moves
  if (selected) {
    const moves = legalMoves.filter(m => m.startsWith(selected))
    moves.forEach(m => {
      const dest = m.slice(2, 4)
      const occupied = chess.get(dest as any)
      if (occupied) {
        customSquareStyles[dest] = {
          background: 'radial-gradient(circle, rgba(0,0,0,0.3) 85%, transparent 85%)',
          borderRadius: '0',
        }
      } else {
        customSquareStyles[dest] = {
          background: 'radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)',
        }
      }
    })
    customSquareStyles[selected] = { backgroundColor: 'rgba(245, 246, 130, 0.6)' }
  }

  // Check highlight
  if (isInCheck) {
    const color = chess.turn() === 'w' ? 'w' : 'b'
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const sq = String.fromCharCode(97 + f) + (r + 1)
      const piece = chess.get(sq as any)
      if (piece && piece.type === 'k' && piece.color === color) {
        customSquareStyles[sq] = { backgroundColor: 'rgba(198, 40, 40, 0.7)' }
      }
    }
  }

  const onSquareClick = useCallback((square: string) => {
    if (!isPlayerTurn || isOver) return

    if (selected) {
      const uci = selected + square
      const isLegal = legalMoves.some(m => m.slice(0, 4) === uci)
      if (isLegal) {
        // Check if promotion needed
        const piece = chess.get(selected as any)
        const isPromoRank = (orientation === 'white' && square[1] === '8') ||
                            (orientation === 'black' && square[1] === '1')
        if (piece?.type === 'p' && isPromoRank) {
          setPromoMove({ from: selected, to: square })
          setSelected(null)
          return
        }
        onMove(selected, square)
        setSelected(null)
        return
      }
    }

    // Select piece
    const piece = chess.get(square as any)
    const myColor = orientation === 'white' ? 'w' : 'b'
    if (piece && piece.color === myColor && chess.turn() === myColor) {
      setSelected(square)
    } else {
      setSelected(null)
    }
  }, [selected, legalMoves, isPlayerTurn, isOver, orientation, chess, onMove])

  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string, piece: string) => {
    if (!isPlayerTurn || isOver) return false
    const isPromoRank = (orientation === 'white' && targetSquare[1] === '8') ||
                        (orientation === 'black' && targetSquare[1] === '1')
    const isPawn = piece.toLowerCase().endsWith('p')
    if (isPawn && isPromoRank) {
      setPromoMove({ from: sourceSquare, to: targetSquare })
      return true
    }
    return onMove(sourceSquare, targetSquare)
  }, [isPlayerTurn, isOver, orientation, onMove])

  return (
    <div className="relative w-full">
      <Chessboard
        position={fen}
        onSquareClick={onSquareClick}
        onPieceDrop={onPieceDrop}
        boardOrientation={orientation}
        customDarkSquareStyle={{ backgroundColor: BOARD_DARK }}
        customLightSquareStyle={{ backgroundColor: BOARD_LIGHT }}
        customSquareStyles={customSquareStyles}
        arePiecesDraggable={isPlayerTurn && !isOver}
        animationDuration={150}
      />

      {/* Promotion modal */}
      {promoMove && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded">
          <div className="bg-chess-card border border-chess-border rounded-xl p-4">
            <p className="text-chess-bright text-sm mb-3 text-center font-semibold">Promote to:</p>
            <div className="flex gap-2">
              {(['q','r','b','n'] as const).map(p => {
                const symbols: Record<string, string> = {
                  q: orientation === 'white' ? '♕' : '♛',
                  r: orientation === 'white' ? '♖' : '♜',
                  b: orientation === 'white' ? '♗' : '♝',
                  n: orientation === 'white' ? '♘' : '♞',
                }
                return (
                  <button key={p} onClick={() => {
                    onMove(promoMove.from, promoMove.to, p)
                    setPromoMove(null)
                  }}
                    className="w-14 h-14 text-4xl bg-chess-bg hover:bg-chess-hover rounded border border-chess-border transition-colors">
                    {symbols[p]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
