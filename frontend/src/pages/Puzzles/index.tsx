import React, { useEffect, useState, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { puzzleApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Puzzle } from '../../types'
import { CheckCircle, XCircle, RefreshCw, Lightbulb, Volume2, VolumeX } from 'lucide-react'

type PuzzleState = 'idle' | 'solving' | 'correct' | 'wrong'

const magnusLines = {
  greeting: [
    "Let's see what we have here.",
    "Alright, focus on the position.",
    "Take your time. Find the best move.",
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
  X_RAY: ["A piece can control squares through another piece. Think about what happens after it moves."],
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
  utterance.rate = 0.95
  utterance.pitch = 0.9
  const voices = speechSynthesis.getVoices()
  const male = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
    voices.find(v => v.lang.startsWith('en-GB')) ||
    voices.find(v => v.lang.startsWith('en'))
  if (male) utterance.voice = male
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
  return text
}

export default function Puzzles() {
  const { user } = useAuth()
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [chess, setChess] = useState(new Chess())
  const [state, setState] = useState<PuzzleState>('idle')
  const [moves, setMoves] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [category, setCategory] = useState('ALL')
  const [streak, setStreak] = useState(0)
  const [voiceOn, setVoiceOn] = useState(true)
  const [magnusMsg, setMagnusMsg] = useState('')

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
        if (voiceOn) setMagnusMsg(magnusSpeak('correct'))
      } else {
        setState('wrong')
        setStreak(0)
        if (voiceOn) setMagnusMsg(magnusSpeak('wrong'))
      }
    } catch {}
    return true
  }

  const categories = ['ALL','FORK','KNIGHT_FORK','PIN','ABSOLUTE_PIN','SKEWER','DISCOVERED_ATTACK',
    'DOUBLE_CHECK','BACK_RANK','DECOY','ATTRACTION','SMOTHERED_MATE','KING_EXTRACTION',
    'GREEK_GIFT','REMOVING_THE_DEFENDER','X_RAY','TRAPPED_PIECE','WINDMILL','COUNTER_THREAT',
    'ZWISCHENZUG','ZUGZWANG','SIMPLIFICATION','STALEMATE','LINEAR_MATE','SACRIFICE',
    'DEFLECTION','INTERFERENCE','CLEARANCE','OVERLOADING','MATING_NET','ENDGAME','TACTICS']

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
            {/* Magnus Carlsen Instructor */}
            <div className="card border-chess-accent/30 bg-gradient-to-br from-chess-card to-chess-bg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-chess-accent flex items-center justify-center text-white text-xs font-bold">MC</div>
                  <div>
                    <p className="text-chess-bright text-sm font-semibold">Magnus Carlsen</p>
                    <p className="text-chess-text text-xs">Instructor</p>
                  </div>
                </div>
                <button onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) speechSynthesis.cancel() }}
                  className="text-chess-text hover:text-chess-bright">
                  {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>
              {magnusMsg && (
                <p className="text-chess-text text-sm italic border-t border-chess-border pt-2 mt-2">"{magnusMsg}"</p>
              )}
              {state === 'solving' && (
                <button onClick={() => {
                  const cat = puzzle?.category || ''
                  const lines = tacticHints[cat] || magnusLines.hint
                  const text = lines[Math.floor(Math.random() * lines.length)]
                  if (voiceOn) { const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u) }
                  setMagnusMsg(text)
                }}
                  className="mt-2 w-full btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                  <Lightbulb size={13} /> Ask for Hint
                </button>
              )}
            </div>
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