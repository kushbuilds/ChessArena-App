import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { RotateCcw, Flag, Home, Handshake } from 'lucide-react'

// Move sounds using Web Audio API
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

function playSound(type: 'move' | 'capture' | 'check') {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  if (type === 'capture') {
    osc.frequency.value = 200
    gain.gain.value = 0.3
    osc.type = 'square'
  } else if (type === 'check') {
    osc.frequency.value = 600
    gain.gain.value = 0.2
    osc.type = 'sine'
  } else {
    osc.frequency.value = 400
    gain.gain.value = 0.15
    osc.type = 'sine'
  }
  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)
  osc.stop(audioCtx.currentTime + 0.1)
}

// --- Chess Engine: Minimax with Alpha-Beta Pruning ---
const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }

const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
]
const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
]
const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
]
const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
]

const PST: Record<string, number[]> = { p: PAWN_TABLE, n: KNIGHT_TABLE, b: BISHOP_TABLE, r: ROOK_TABLE }

function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) return game.turn() === 'w' ? -99999 : 99999
  if (game.isDraw() || game.isStalemate()) return 0

  let score = 0
  const board = game.board()
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece) continue
      const value = PIECE_VALUES[piece.type] || 0
      const pst = PST[piece.type]
      const posBonus = pst ? (piece.color === 'w' ? pst[r * 8 + c] : pst[(7 - r) * 8 + c]) : 0
      score += piece.color === 'w' ? (value + posBonus) : -(value + posBonus)
    }
  }
  return score
}

function orderMoves(game: Chess, moves: any[]): any[] {
  return moves.sort((a: any, b: any) => {
    let scoreA = 0, scoreB = 0
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece]
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece]
    if (a.san.includes('+')) scoreA += 50
    if (b.san.includes('+')) scoreB += 50
    if (a.promotion) scoreA += 800
    if (b.promotion) scoreB += 800
    return scoreB - scoreA
  })
}

let searchDeadline = 0

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  if (Date.now() > searchDeadline) return evaluateBoard(game)
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game)
  const moves = orderMoves(game, game.moves({ verbose: true }))
  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      game.move(move)
      const eval_ = minimax(game, depth - 1, alpha, beta, false)
      game.undo()
      maxEval = Math.max(maxEval, eval_)
      alpha = Math.max(alpha, eval_)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      game.move(move)
      const eval_ = minimax(game, depth - 1, alpha, beta, true)
      game.undo()
      minEval = Math.min(minEval, eval_)
      beta = Math.min(beta, eval_)
      if (beta <= alpha) break
    }
    return minEval
  }
}

function findBestMove(game: Chess, depth: number): any {
  searchDeadline = Date.now() + 1500 // Max 1.5 seconds thinking time
  const moves = orderMoves(game, game.moves({ verbose: true }))
  const isMaximizing = game.turn() === 'w'
  let bestMove = moves[0]
  let bestEval = isMaximizing ? -Infinity : Infinity
  for (const move of moves) {
    game.move(move)
    const eval_ = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing)
    game.undo()
    if (isMaximizing ? eval_ > bestEval : eval_ < bestEval) {
      bestEval = eval_
      bestMove = move
    }
  }
  return bestMove
}

export default function ComputerGame() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const playerColor = (searchParams.get('color') || 'white') as 'white' | 'black'
  const timeControl = parseInt(searchParams.get('time') || '300') * 1000

  const [game, setGame] = useState(new Chess())
  const [whiteTime, setWhiteTime] = useState(timeControl)
  const [blackTime, setBlackTime] = useState(timeControl)
  const [gameOver, setGameOver] = useState<string | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gameRef = useRef(game)
  gameRef.current = game

  const isPlayerTurn = (game.turn() === 'w' && playerColor === 'white') ||
                       (game.turn() === 'b' && playerColor === 'black')

  // Timer
  useEffect(() => {
    if (gameOver) { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      const g = gameRef.current
      if (g.isGameOver()) return
      if (g.turn() === 'w') {
        setWhiteTime(t => {
          if (t <= 100) { setGameOver('Black wins on time!'); return 0 }
          return t - 100
        })
      } else {
        setBlackTime(t => {
          if (t <= 100) { setGameOver('White wins on time!'); return 0 }
          return t - 100
        })
      }
    }, 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameOver])

  // Computer move with minimax + alpha-beta pruning
  const makeComputerMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return
    setTimeout(() => {
      const moves = currentGame.moves({ verbose: true })
      if (moves.length === 0) return

      const level = parseInt(searchParams.get('level') || '5')
      const depth = level <= 5 ? 2 : level <= 15 ? 3 : 3
      const bestMove = findBestMove(new Chess(currentGame.fen()), depth)
      const move = currentGame.move(bestMove)
      if (!move) return

      playSound(move.captured ? 'capture' : currentGame.inCheck() ? 'check' : 'move')
      setGame(new Chess(currentGame.fen()))
      setLastMove({ from: move.from, to: move.to })
      checkGameOver(currentGame)
    }, 400)
  }, [])

  // If computer plays first (player is black)
  useEffect(() => {
    if (playerColor === 'black' && game.turn() === 'w' && game.moveNumber() === 1) {
      makeComputerMove(game)
    }
  }, [])

  const checkGameOver = (g: Chess) => {
    if (g.isCheckmate()) setGameOver(`Checkmate! ${g.turn() === 'w' ? 'Black' : 'White'} wins!`)
    else if (g.isStalemate()) setGameOver('Stalemate! Draw.')
    else if (g.isDraw()) setGameOver('Draw!')
  }

  const handleMove = useCallback((from: string, to: string): boolean => {
    if (gameOver || !isPlayerTurn) return false
    const gameCopy = new Chess(game.fen())
    const move = gameCopy.move({ from, to, promotion: 'q' })
    if (!move) return false
    playSound(move.captured ? 'capture' : gameCopy.inCheck() ? 'check' : 'move')
    setGame(new Chess(gameCopy.fen()))
    setLastMove({ from, to })
    setSelected(null)
    checkGameOver(gameCopy)
    if (!gameCopy.isGameOver()) makeComputerMove(gameCopy)
    return true
  }, [game, gameOver, isPlayerTurn, makeComputerMove])

  const formatTime = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000))
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  const customSquareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(245,246,130,0.4)' }
    customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(245,246,130,0.4)' }
  }
  if (selected) {
    customSquareStyles[selected] = { backgroundColor: 'rgba(245,246,130,0.6)' }
    const g = new Chess(game.fen())
    g.moves({ square: selected as any, verbose: true }).forEach(m => {
      customSquareStyles[m.to] = m.captured
        ? { background: 'radial-gradient(circle, rgba(0,0,0,0.3) 85%, transparent 85%)' }
        : { background: 'radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)' }
    })
  }
  if (game.inCheck()) {
    const kingSquare = (() => {
      const board = game.board()
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = board[r][c]
        if (p && p.type === 'k' && p.color === game.turn())
          return String.fromCharCode(97 + c) + (8 - r)
      }
      return null
    })()
    if (kingSquare) customSquareStyles[kingSquare] = { backgroundColor: 'rgba(198,40,40,0.7)' }
  }

  const opponentTime = playerColor === 'white' ? blackTime : whiteTime
  const myTime = playerColor === 'white' ? whiteTime : blackTime

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 md:p-4">
      <div className="w-full max-w-[600px] space-y-2">
        {/* Opponent timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-chess-bright font-semibold">Computer</span>
          </div>
          <div className={`px-3 py-1 rounded font-mono text-lg font-bold ${!isPlayerTurn && !gameOver ? 'bg-chess-accent text-white' : 'bg-chess-card text-chess-text'}`}>
            {formatTime(opponentTime)}
          </div>
        </div>

        {/* Board */}
        <Chessboard
          position={game.fen()}
          onPieceDrop={(s, t) => handleMove(s, t)}
          onSquareClick={(sq) => {
            if (selected) { handleMove(selected, sq); setSelected(null) }
            else {
              const p = game.get(sq as any)
              const myColor = playerColor === 'white' ? 'w' : 'b'
              if (p && p.color === myColor && game.turn() === myColor) setSelected(sq)
              else setSelected(null)
            }
          }}
          boardOrientation={playerColor}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#EEEED2' }}
          customSquareStyles={customSquareStyles}
          arePiecesDraggable={isPlayerTurn && !gameOver}
          animationDuration={150}
        />

        {/* Player timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <span className="text-chess-bright font-semibold">You</span>
          </div>
          <div className={`px-3 py-1 rounded font-mono text-lg font-bold ${isPlayerTurn && !gameOver ? 'bg-chess-accent text-white' : 'bg-chess-card text-chess-text'}`}>
            {formatTime(myTime)}
          </div>
        </div>

        {/* Game over banner */}
        {gameOver && (
          <div className="bg-chess-card border border-chess-border rounded-lg p-4 text-center">
            <p className="text-chess-bright text-lg font-bold">{gameOver}</p>
            <div className="flex gap-2 mt-3 justify-center">
              <button onClick={() => { setGame(new Chess()); setGameOver(null); setWhiteTime(timeControl); setBlackTime(timeControl); setLastMove(null); if (playerColor === 'black') makeComputerMove(new Chess()) }}
                className="btn-primary px-4 py-2 flex items-center gap-2"><RotateCcw size={16} /> Rematch</button>
              <button onClick={() => navigate('/play')}
                className="btn-secondary px-4 py-2 flex items-center gap-2"><Home size={16} /> Back</button>
            </div>
          </div>
        )}

        {/* Controls */}
        {!gameOver && (
          <div className="flex gap-2 justify-center">
            <button onClick={() => setGameOver('Draw by agreement.')}
              className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"><Handshake size={14} /> Draw</button>
            <button onClick={() => setGameOver(`${playerColor === 'white' ? 'Black' : 'White'} wins! You resigned.`)}
              className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"><Flag size={14} /> Resign</button>
          </div>
        )}
      </div>
    </div>
  )
}
