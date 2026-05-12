import React, { useEffect, useState, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { puzzleApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Puzzle } from '../../types'
import { CheckCircle, XCircle, RefreshCw, Lightbulb } from 'lucide-react'

type PuzzleState = 'idle' | 'solving' | 'correct' | 'wrong'

export default function Puzzles() {
  const { user } = useAuth()
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [chess, setChess] = useState(new Chess())
  const [state, setState] = useState<PuzzleState>('idle')
  const [moves, setMoves] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [category, setCategory] = useState('ALL')
  const [streak, setStreak] = useState(0)

  const loadPuzzle = useCallback(async () => {
    setState('idle')
    setMoves([])
    setSelected(null)
    try {
      const p = await puzzleApi.getRandomPuzzle()
      setPuzzle(p)
      const c = new Chess(p.fen)
      setChess(c)
      setState('solving')
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => { loadPuzzle() }, [])

  const handleMove = async (from: string, to: string) => {
    if (state !== 'solving' || !puzzle) return false
    const piece = chess.get(from as any)
    if (!piece) return false

    const result = chess.move({ from, to, promotion: 'q' })
    if (!result) return false

    const uci = from + to
    const newMoves = [...moves, uci]
    setMoves(newMoves)
    setChess(new Chess(chess.fen()))

    try {
      const resp = await puzzleApi.submitAttempt(puzzle.id, newMoves.join(' '), 0)
      if (resp.solved) {
        setState('correct')
        setStreak(s => s + 1)
      } else {
        setState('wrong')
        setStreak(0)
      }
    } catch {}
    return true
  }

  const categories = ['ALL','TACTICS','ENDGAME','MATING_NET','FORK','PIN','SKEWER']

  const customSquareStyles: Record<string, React.CSSProperties> = {}
  if (selected) customSquareStyles[selected] = { backgroundColor: 'rgba(245,246,130,0.6)' }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-chess-bright">Chess Puzzles</h1>
          <div className="flex items-center gap-3">
            <span className="text-chess-text text-sm">Streak: <span className="text-chess-accent font-bold">{streak}</span></span>
            <button onClick={loadPuzzle} className="btn-secondary flex items-center gap-1 text-sm py-1.5">
              <RefreshCw size={14} /> Next
            </button>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded text-xs font-medium ${category === c ? 'bg-chess-accent text-white' : 'bg-chess-card text-chess-text border border-chess-border hover:bg-chess-hover'}`}>
              {c.replace(/_/g,' ')}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Board */}
          <div className="flex-1 max-w-[500px]">
            {puzzle && (
              <Chessboard
                position={chess.fen()}
                onPieceDrop={(s, t) => { handleMove(s, t); return true }}
                onSquareClick={(sq) => {
                  if (selected) { handleMove(selected, sq); setSelected(null) }
                  else { const p = chess.get(sq as any); if (p) setSelected(sq) }
                }}
                boardOrientation={chess.turn() === 'w' ? 'white' : 'black'}
                customDarkSquareStyle={{ backgroundColor: '#769656' }}
                customLightSquareStyle={{ backgroundColor: '#EEEED2' }}
                customSquareStyles={customSquareStyles}
                animationDuration={150}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            {puzzle && (
              <div className="card">
                <h3 className="font-bold text-chess-bright mb-1">{puzzle.title}</h3>
                <p className="text-chess-text text-sm mb-3">{puzzle.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-chess-text">Rating</span>
                  <span className="font-bold text-chess-accent">{puzzle.rating}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-chess-text">Category</span>
                  <span className="text-chess-bright text-xs">{puzzle.category?.replace(/_/g,' ')}</span>
                </div>
                <div className="mt-3 text-sm text-chess-text">
                  {chess.turn() === 'w' ? '♔ White' : '♚ Black'} to move
                </div>
              </div>
            )}

            {state === 'correct' && (
              <div className="card border-chess-accent bg-chess-accent/10">
                <div className="flex items-center gap-2 text-chess-accent font-semibold">
                  <CheckCircle size={18} /> Correct!
                </div>
                <button onClick={loadPuzzle} className="btn-primary w-full mt-3 text-sm py-1.5">Next Puzzle</button>
              </div>
            )}
            {state === 'wrong' && (
              <div className="card border-chess-red bg-chess-red/10">
                <div className="flex items-center gap-2 text-chess-red font-semibold">
                  <XCircle size={18} /> Not quite!
                </div>
                <button onClick={loadPuzzle} className="btn-secondary w-full mt-3 text-sm py-1.5">Try Another</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}