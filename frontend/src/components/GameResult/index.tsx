import React from 'react'
import { X, RotateCcw, Plus, BarChart2 } from 'lucide-react'
import { GameStatus } from '../../types'

interface Props {
  isVisible: boolean
  winner: string | null
  status: GameStatus
  resultReason: string | null
  playerColor: 'white' | 'black' | null
  whitePlayer: string
  blackPlayer: string
  whiteRatingChange: number
  blackRatingChange: number
  onRematch: () => void
  onNewGame: () => void
  onAnalyze: () => void
  onClose: () => void
}

export default function GameResult({ isVisible, winner, status, resultReason, playerColor, whitePlayer, blackPlayer, whiteRatingChange, blackRatingChange, onRematch, onNewGame, onAnalyze, onClose }: Props) {
  if (!isVisible) return null

  const isDraw = winner === 'draw'
  const playerWon = playerColor && winner === playerColor
  const playerLost = playerColor && winner && winner !== 'draw' && winner !== playerColor

  const headline = isDraw ? '½ Draw ½'
    : playerWon ? '🏆 You Win!'
    : playerLost ? '😞 You Lost'
    : winner === 'white' ? 'White Wins' : 'Black Wins'

  const myChange = playerColor === 'white' ? whiteRatingChange : blackRatingChange
  const changeColor = myChange >= 0 ? 'text-chess-accent' : 'text-chess-red'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-chess-card border border-chess-border rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-chess-bright">{headline}</h2>
          <button onClick={onClose} className="text-chess-text hover:text-chess-bright"><X size={20} /></button>
        </div>

        {resultReason && (
          <p className="text-chess-text text-sm mb-4">
            {resultReason} · {status.replace(/_/g, ' ')}
          </p>
        )}

        <div className="flex justify-between items-center mb-6 text-sm">
          <div className="text-center">
            <div className="text-chess-bright font-medium">♔ {whitePlayer}</div>
            <div className={whiteRatingChange >= 0 ? 'text-chess-accent' : 'text-chess-red'}>
              {whiteRatingChange >= 0 ? '+' : ''}{whiteRatingChange}
            </div>
          </div>
          <div className="text-chess-text">vs</div>
          <div className="text-center">
            <div className="text-chess-bright font-medium">♚ {blackPlayer}</div>
            <div className={blackRatingChange >= 0 ? 'text-chess-accent' : 'text-chess-red'}>
              {blackRatingChange >= 0 ? '+' : ''}{blackRatingChange}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={onRematch} className="btn-primary w-full flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Rematch
          </button>
          <div className="flex gap-2">
            <button onClick={onNewGame} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm">
              <Plus size={14} /> New Game
            </button>
            <button onClick={onAnalyze} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm">
              <BarChart2 size={14} /> Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
