import React from 'react'
import { Flag, Handshake, RotateCcw, Plus, BarChart2 } from 'lucide-react'
import { GameStatus } from '../../types'

interface Props {
  onResign: () => void
  onOfferDraw: () => void
  onFlipBoard: () => void
  onRematch?: () => void
  onNewGame?: () => void
  onAnalyze?: () => void
  canResign: boolean
  canOfferDraw: boolean
  gameStatus: GameStatus
}

const isOver = (s: GameStatus) =>
  ['CHECKMATE','STALEMATE','DRAW','RESIGNED','TIMEOUT','DRAW_AGREED','INSUFFICIENT_MATERIAL','FIFTY_MOVE_RULE'].includes(s)

export default function GameControls({ onResign, onOfferDraw, onFlipBoard, onRematch, onNewGame, onAnalyze, canResign, canOfferDraw, gameStatus }: Props) {
  const over = isOver(gameStatus)
  return (
    <div className="space-y-2">
      {!over ? (
        <div className="flex gap-2">
          {canResign && (
            <button onClick={onResign} className="btn-danger flex-1 flex items-center justify-center gap-1 text-sm py-1.5">
              <Flag size={14} /> Resign
            </button>
          )}
          {canOfferDraw && (
            <button onClick={onOfferDraw} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm py-1.5">
              <Handshake size={14} /> Draw
            </button>
          )}
          <button onClick={onFlipBoard} className="btn-secondary px-2 py-1.5" title="Flip board">
            <RotateCcw size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {onRematch && (
            <button onClick={onRematch} className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm py-1.5">
              <RotateCcw size={14} /> Rematch
            </button>
          )}
          {onNewGame && (
            <button onClick={onNewGame} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm py-1.5">
              <Plus size={14} /> New Game
            </button>
          )}
          {onAnalyze && (
            <button onClick={onAnalyze} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm py-1.5">
              <BarChart2 size={14} /> Analyze
            </button>
          )}
          <button onClick={onFlipBoard} className="btn-secondary px-2 py-1.5" title="Flip">
            <RotateCcw size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
