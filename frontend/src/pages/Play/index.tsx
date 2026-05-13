import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { wsService } from '../../services/websocket'
import { gameApi } from '../../services/api'
import { Loader2, Bot, Users, X } from 'lucide-react'

const TIME_CONTROLS = [
  { key: 'BULLET_1',    label: '1+0',   category: 'Bullet'    },
  { key: 'BULLET_2',    label: '2+1',   category: 'Bullet'    },
  { key: 'BLITZ_3',     label: '3+0',   category: 'Blitz'     },
  { key: 'BLITZ_3_2',   label: '3+2',   category: 'Blitz'     },
  { key: 'BLITZ_5',     label: '5+0',   category: 'Blitz'     },
  { key: 'BLITZ_5_5',   label: '5+5',   category: 'Blitz'     },
  { key: 'RAPID_10',    label: '10+0',  category: 'Rapid'     },
  { key: 'RAPID_15_10', label: '15+10', category: 'Rapid'     },
  { key: 'CLASSICAL_30',label: '30+0',  category: 'Classical' },
]

type Mode = 'human' | 'computer'

export default function Play() {
  const [mode, setMode] = useState<Mode>('human')
  const [tc, setTc] = useState('BLITZ_5')
  const [color, setColor] = useState<'white'|'black'|'random'>('random')
  const [level, setLevel] = useState(5)
  const [seeking, setSeeking] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()
  const { setGameState, joinGame } = useGame()

  useEffect(() => {
    if (!isAuthenticated || !token) return
    wsService.connect(token, () => {
      wsService.subscribe('/user/queue/game-found', (msg: any) => {
        setSeeking(false)
        joinGame(msg.gameId, msg.yourColor, false)
        navigate(`/game/${msg.gameId}`)
      })
    }, console.error)
    return () => { if (!seeking) wsService.disconnect() }
  }, [isAuthenticated, token])

  const handlePlay = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (mode === 'computer') {
      const selectedTc = TIME_CONTROLS.find(t => t.key === tc)
      const baseTime = selectedTc ? parseInt(selectedTc.label) * 60 : 300
      const chosenColor = color === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : color
      navigate(`/computer?color=${chosenColor}&time=${baseTime}&level=${level}`)
    } else {
      setSeeking(true)
      wsService.send('/app/lobby/seek', { timeControl: tc })
    }
  }

  const cancelSeek = () => {
    wsService.send('/app/lobby/cancel', { timeControl: tc })
    setSeeking(false)
  }

  const categories = [...new Set(TIME_CONTROLS.map(t => t.category))]

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-chess-bright text-center mb-8">Play Chess</h1>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('human')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${mode === 'human' ? 'bg-chess-accent text-white' : 'btn-secondary'}`}>
            <Users size={18} /> Play Online
          </button>
          <button onClick={() => setMode('computer')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${mode === 'computer' ? 'bg-chess-accent text-white' : 'btn-secondary'}`}>
            <Bot size={18} /> vs Computer
          </button>
        </div>

        <div className="card space-y-5">
          {/* Time controls */}
          <div>
            <h3 className="text-chess-bright font-semibold mb-3">Time Control</h3>
            {categories.map(cat => (
              <div key={cat} className="mb-3">
                <p className="text-chess-text text-xs uppercase tracking-wide mb-1">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_CONTROLS.filter(t => t.category === cat).map(t => (
                    <button key={t.key} onClick={() => setTc(t.key)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${tc === t.key ? 'bg-chess-accent text-white' : 'bg-chess-bg hover:bg-chess-hover text-chess-text border border-chess-border'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Color picker */}
          <div>
            <h3 className="text-chess-bright font-semibold mb-3">Play as</h3>
            <div className="flex gap-2">
              {(['white','random','black'] as const).map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`flex-1 py-2 rounded text-sm font-medium capitalize transition-colors ${color === c ? 'bg-chess-accent text-white' : 'bg-chess-bg hover:bg-chess-hover text-chess-text border border-chess-border'}`}>
                  {c === 'random' ? '🎲 Random' : c === 'white' ? '♔ White' : '♚ Black'}
                </button>
              ))}
            </div>
          </div>

          {/* Computer level */}
          {mode === 'computer' && (
            <div>
              <h3 className="text-chess-bright font-semibold mb-2">Difficulty: <span className="text-chess-accent">{level}/20</span></h3>
              <input type="range" min={1} max={20} value={level} onChange={e => setLevel(+e.target.value)}
                className="w-full accent-chess-accent" />
              <div className="flex justify-between text-xs text-chess-text mt-1">
                <span>Beginner</span><span>Intermediate</span><span>Master</span>
              </div>
            </div>
          )}

          {seeking ? (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-chess-accent">
                <Loader2 size={20} className="animate-spin" />
                <span className="font-medium">Seeking opponent...</span>
              </div>
              <button onClick={cancelSeek} className="btn-secondary w-full flex items-center justify-center gap-2">
                <X size={16} /> Cancel
              </button>
            </div>
          ) : (
            <button onClick={handlePlay} className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-chess-accent/20">
              {mode === 'human' ? '⚔️ Find Game' : '▶ Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
