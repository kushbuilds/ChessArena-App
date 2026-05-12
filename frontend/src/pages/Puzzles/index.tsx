import React, { useEffect, useState, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { puzzleApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Puzzle } from '../../types'
import { CheckCircle, XCircle, RefreshCw, Lightbulb, Volume2, VolumeX, Flame, Trophy } from 'lucide-react'

type PuzzleState = 'idle' | 'solving' | 'correct' | 'wrong'

const magnusLines = {
  greeting: [
    "It's time to get solving!",
    "Let's sharpen your tactics.",
    "Focus on the position. Find the best move.",
  ],
  hint: [
    "Look for checks and captures first.",
    "Think about what your opponent wants to do.",
    "There's a tactical pattern here. Can you see it?",
    "Consider the most forcing move.",
    "Look at the weakest square around the king.",
  ],
  correct: [
    "Excellent! That's exactly right.",
    "Well played! You found it.",
    "Perfect. That's the move I would play.",
    "Very nice. You're thinking like a grandmaster.",
  ],
  wrong: [
    "Not quite. Think again about the position.",
    "That's not it. Look for something more forcing.",
    "Try again. The answer is sharper than that.",
  ],
}

const tacticHints: Record<string, string[]> = {
  FORK: ["One piece can attack two targets at once. Look for a fork!"],
  KNIGHT_FORK: ["Knights are tricky. Can it jump to a square attacking two pieces?"],
  PIN: ["A pinned piece cannot move. Look for a piece stuck in front of a more valuable one."],
  ABSOLUTE_PIN: ["The piece is pinned to the king — it literally cannot move. Exploit it!"],
  SKEWER: ["A skewer is like a reverse pin. Attack the valuable piece to win what's behind it."],
  DISCOVERED_ATTACK: ["Move one piece to reveal an attack from another. Discovered attacks are deadly."],
  BACK_RANK: ["The king is trapped on the back rank by its own pawns. Can you deliver mate?"],
  DOUBLE_CHECK: ["Two pieces giving check at once! The king must move — there's no other defense."],
  DECOY: ["Lure the enemy piece to a bad square. Sacrifice something to pull it away."],
  ATTRACTION: ["Force a piece to a specific square where it becomes vulnerable."],
  SMOTHERED_MATE: ["The king is surrounded by its own pieces. A knight can deliver mate!"],
  KING_EXTRACTION: ["Drag the king out into the open, even if it costs material."],
  GREEK_GIFT: ["The classic bishop sacrifice on h7. After Bxh7+, the king is exposed."],
  REMOVING_THE_DEFENDER: ["Remove the piece that guards the key square or piece."],
  X_RAY: ["Control squares through other pieces. Think about what happens after it moves."],
  TRAPPED_PIECE: ["The piece has no safe squares. Can you win it?"],
  WINDMILL: ["Repeated discovered checks can win huge material. Look for the windmill pattern."],
  COUNTER_THREAT: ["Instead of defending, create a bigger threat! Make them respond to you."],
  ZWISCHENZUG: ["Before making the obvious recapture, insert an in-between move first."],
  ZUGZWANG: ["Your opponent must move, but every move makes their position worse."],
  SIMPLIFICATION: ["Trade pieces to reach a winning endgame. Sometimes less is more."],
  STALEMATE: ["Be careful! If the opponent has no legal moves and isn't in check, it's a draw."],
  LINEAR_MATE: ["Two rooks work together — one cuts off the king, the other delivers mate."],
  SACRIFICE: ["Give up material now for a decisive advantage. Calculate the follow-up!"],
  DEFLECTION: ["Force the defending piece away from its duty."],
  INTERFERENCE: ["Place a piece to cut the connection between enemy pieces."],
  CLEARANCE: ["Move your own piece out of the way to open a line for another."],
  OVERLOADING: ["The defender has too many jobs. Attack what it's protecting!"],
  MATING_NET: ["The king is almost trapped. Find the checkmate!"],
  ENDGAME: ["Endgames are about precision. Use your king actively and push passed pawns."],
  TACTICS: ["Look for the most forcing continuation. Checks, captures, threats — in that order."],
}

function magnusSpeak(category: keyof typeof magnusLines) {
  const lines = magnusLines[category]
  const text = lines[Math.floor(Math.random() * lines.length)]
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.88
  utterance.pitch = 0.75
  utterance.volume = 1.0
  const voices = speechSynthesis.getVoices()
  const preferred = voices.find(v => v.name.includes('Daniel') && v.lang.startsWith('en')) ||
    voices.find(v => v.name.includes('Aaron')) ||
    voices.find(v => v.name.includes('Arthur')) ||
    voices.find(v => v.lang.startsWith('en-GB') && !v.name.includes('Female')) ||
    voices.find(v => v.lang.startsWith('en'))
  if (preferred) utterance.voice = preferred
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
  return text
}

// Puzzle path levels
const TOTAL_LEVELS = 16

export default function Puzzles() {
  const { user } = useAuth()
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [chess, setChess] = useState(new Chess())
  const [state, setState] = useState<PuzzleState>('idle')
  const [moves, setMoves] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [solved, setSolved] = useState(0)
  const [voiceOn, setVoiceOn] = useState(true)
  const [magnusMsg, setMagnusMsg] = useState("It's time to get solving!")
  const [puzzleRating, setPuzzleRating] = useState(user?.puzzleRating || 1200)

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
      if (voiceOn) setMagnusMsg(magnusSpeak('greeting'))
    } catch (e) { console.error(e) }
  }, [voiceOn])

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
        setSolved(s => s + 1)
        setPuzzleRating(r => r + 8)
        if (voiceOn) setMagnusMsg(magnusSpeak('correct'))
      } else {
        setState('wrong')
        setStreak(0)
        if (voiceOn) setMagnusMsg(magnusSpeak('wrong'))
      }
    } catch {}
    return true
  }

  const askHint = () => {
    const cat = puzzle?.category || ''
    const lines = tacticHints[cat] || magnusLines.hint
    const text = lines[Math.floor(Math.random() * lines.length)]
    if (voiceOn) {
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.88; u.pitch = 0.75
      speechSynthesis.cancel(); speechSynthesis.speak(u)
    }
    setMagnusMsg(text)
  }

  const customSquareStyles: Record<string, React.CSSProperties> = {}
  if (selected) {
    customSquareStyles[selected] = { backgroundColor: 'rgba(245,246,130,0.6)' }
    const c = new Chess(chess.fen())
    const legalMoves = c.moves({ square: selected as any, verbose: true })
    legalMoves.forEach(m => {
      if (m.captured) {
        customSquareStyles[m.to] = { background: 'radial-gradient(circle, rgba(0,0,0,0.3) 85%, transparent 85%)' }
      } else {
        customSquareStyles[m.to] = { background: 'radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)' }
      }
    })
  }

  const progressPercent = Math.min((solved % 5) / 5 * 100, 100)

  return (
    <div className="min-h-screen flex bg-chess-bg">
      {/* Main board area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[640px]">
          {puzzle && (
            <Chessboard
              position={chess.fen()}
              onPieceDrop={(s, t) => { handleMove(s, t); return true }}
              onSquareClick={(sq) => {
                if (selected) { handleMove(selected, sq); setSelected(null) }
                else { const p = chess.get(sq as any); if (p) setSelected(sq) }
              }}
              boardOrientation={puzzle ? (new Chess(puzzle.fen).turn() === 'w' ? 'black' : 'white') : 'white'}
              customDarkSquareStyle={{ backgroundColor: '#779AB6' }}
              customLightSquareStyle={{ backgroundColor: '#E8EDF9' }}
              customSquareStyles={customSquareStyles}
              animationDuration={150}
            />
          )}
        </div>
      </div>

      {/* Right sidebar - puzzle path */}
      <div className="w-80 bg-chess-card border-l border-chess-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-chess-border">
          <div className="flex items-center gap-2">
            <span className="bg-chess-accent text-white text-xs font-bold px-2 py-0.5 rounded">{solved}</span>
            <h2 className="text-xl font-bold text-chess-bright">Puzzles</h2>
          </div>
        </div>

        {/* Magnus instructor */}
        <div className="p-4 border-b border-chess-border">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-lg flex-shrink-0 border-2 border-amber-300">
              👨‍💼
            </div>
            <div className="bg-white dark:bg-chess-bg rounded-lg p-3 shadow-sm border border-chess-border relative">
              <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white dark:border-r-chess-bg"></div>
              <p className="text-chess-bright text-sm">{magnusMsg}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-chess-text text-xs">Magnus Carlsen</span>
            <button onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) speechSynthesis.cancel() }}
              className="text-chess-text hover:text-chess-bright">
              {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>

        {/* Puzzle path - gamified levels */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-green-900/20 to-green-950/30">
          <div className="flex flex-col items-center gap-3">
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
              const level = TOTAL_LEVELS - i
              const isCompleted = level <= solved
              const isCurrent = level === solved + 1
              return (
                <div key={level} className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border-2 transition-all
                  ${isCompleted ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/30' :
                    isCurrent ? 'bg-chess-accent border-chess-accent text-white animate-pulse shadow-lg shadow-chess-accent/30' :
                    'bg-chess-bg border-chess-border text-chess-text'}`}
                  style={{ marginLeft: `${Math.sin(i * 0.8) * 40}px` }}>
                  {isCompleted ? <CheckCircle size={18} /> : level}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom stats & actions */}
        <div className="p-4 border-t border-chess-border space-y-3">
          {/* Rating & streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              <span className="text-chess-bright font-bold">{puzzleRating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame size={16} className="text-orange-500" />
              <span className="text-chess-bright font-bold">{streak}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-chess-bg rounded-full h-2.5">
            <div className="bg-yellow-500 h-2.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>

          {/* Action buttons */}
          {state === 'solving' && (
            <button onClick={askHint}
              className="w-full py-2 rounded-lg bg-chess-bg border border-chess-border text-chess-text hover:text-chess-bright hover:border-chess-accent text-sm flex items-center justify-center gap-2 transition-colors">
              <Lightbulb size={14} /> Get a Hint
            </button>
          )}

          {state === 'correct' && (
            <button onClick={loadPuzzle}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-base transition-colors">
              Next Puzzle →
            </button>
          )}

          {state === 'wrong' && (
            <button onClick={loadPuzzle}
              className="w-full py-3 rounded-lg bg-chess-accent hover:bg-chess-accent/80 text-white font-bold text-base transition-colors">
              Try Another
            </button>
          )}

          {state === 'idle' && (
            <button onClick={loadPuzzle}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-base transition-colors">
              Solve Puzzles
            </button>
          )}

          {/* Puzzle info */}
          {puzzle && state === 'solving' && (
            <div className="text-center">
              <p className="text-chess-text text-xs">{puzzle.category?.replace(/_/g, ' ')} • Rating {puzzle.rating}</p>
              <p className="text-chess-bright text-sm mt-1 font-medium">
                {chess.turn() === 'w' ? '♔ White' : '♚ Black'} to move
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
