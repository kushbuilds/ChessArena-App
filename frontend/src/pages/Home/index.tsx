import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { puzzleApi, leaderboardApi, gameApi } from '../../services/api'
import { Puzzle } from '../../types'
import { Flame, Brain, Star, Gamepad2, Bot, Users, ChevronRight, Clock } from 'lucide-react'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [daily, setDaily] = useState<Puzzle | null>(null)
  const [leaders, setLeaders] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    puzzleApi.getDailyPuzzle().then(setDaily).catch(() => {})
    leaderboardApi.getLeaderboard('blitz').then(d => setLeaders(d.slice(0, 5))).catch(() => {})
    if (user?.username) {
      gameApi.getGameHistory(user.username).then(d => setGames(d.slice(0, 8))).catch(() => {})
    }
  }, [user])

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="text-8xl mb-6">♟</div>
          <h1 className="text-5xl font-bold text-chess-bright mb-4">Play Chess Online</h1>
          <p className="text-chess-text text-lg mb-8">Play, learn, and compete with players worldwide.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/play" className="btn-primary text-lg px-8 py-3 rounded-lg">Play as Guest</Link>
            <Link to="/register" className="btn-secondary text-lg px-8 py-3 rounded-lg">Sign Up Free</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-screen">
      {/* Main content */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* User stats banner */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-chess-accent flex items-center justify-center text-white font-bold text-lg">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-chess-bright font-bold text-lg">{user?.username}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-chess-card border border-chess-border rounded-lg p-4 flex items-center gap-3">
            <Flame className="text-orange-400" size={28} />
            <div>
              <p className="text-chess-text text-xs">Streak</p>
              <p className="text-chess-bright font-bold text-xl">{user?.gamesWon || 0} Day</p>
            </div>
          </div>
          <div className="bg-chess-card border border-chess-border rounded-lg p-4 flex items-center gap-3">
            <Brain className="text-green-400" size={28} />
            <div>
              <p className="text-chess-text text-xs">Puzzles</p>
              <p className="text-chess-bright font-bold text-xl">{user?.puzzleRating || 1200}</p>
            </div>
          </div>
          <div className="bg-chess-card border border-chess-border rounded-lg p-4 flex items-center gap-3">
            <Star className="text-yellow-400" size={28} />
            <div>
              <p className="text-chess-text text-xs">Rating</p>
              <p className="text-chess-bright font-bold text-xl">{user?.blitzRating || 1200}</p>
            </div>
          </div>
          <div className="bg-chess-card border border-chess-border rounded-lg p-4 flex items-center gap-3">
            <Gamepad2 className="text-blue-400" size={28} />
            <div>
              <p className="text-chess-text text-xs">Games</p>
              <p className="text-chess-bright font-bold text-xl">{user?.gamesPlayed || 0}</p>
            </div>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link to="/play" className="bg-chess-card border border-chess-border rounded-lg p-4 hover:border-chess-accent transition-colors group text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={18} className="text-chess-text group-hover:text-chess-accent" />
            </div>
            <p className="text-chess-bright font-semibold text-sm group-hover:text-chess-accent">New Game</p>
          </Link>
          <Link to="/play" className="bg-chess-card border border-chess-border rounded-lg p-4 hover:border-chess-accent transition-colors group text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bot size={18} className="text-chess-text group-hover:text-chess-accent" />
            </div>
            <p className="text-chess-bright font-semibold text-sm group-hover:text-chess-accent">Play Bots</p>
          </Link>
          <Link to="/puzzles" className="bg-chess-card border border-chess-border rounded-lg p-4 hover:border-chess-accent transition-colors group text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain size={18} className="text-chess-text group-hover:text-chess-accent" />
            </div>
            <p className="text-chess-bright font-semibold text-sm group-hover:text-chess-accent">Solve Puzzle</p>
          </Link>
          <Link to="/friends" className="bg-chess-card border border-chess-border rounded-lg p-4 hover:border-chess-accent transition-colors group text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users size={18} className="text-chess-text group-hover:text-chess-accent" />
            </div>
            <p className="text-chess-bright font-semibold text-sm group-hover:text-chess-accent">Play a Friend</p>
          </Link>
        </div>

        {/* Game History */}
        <div className="bg-chess-card border border-chess-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-chess-border">
            <h2 className="text-chess-bright font-bold">Game History</h2>
          </div>
          {games.length > 0 ? (
            <div className="divide-y divide-chess-border">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs text-chess-text font-medium">
                <span></span><span>Players</span><span>Result</span><span>Moves</span><span>Date</span>
              </div>
              {games.map((g: any, i: number) => {
                const isWhite = g.whitePlayer === user?.username
                const won = (isWhite && g.winner === 'white') || (!isWhite && g.winner === 'black')
                const lost = (isWhite && g.winner === 'black') || (!isWhite && g.winner === 'white')
                return (
                  <div key={i} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-chess-hover text-sm">
                    <span className="text-chess-text text-xs">{g.timeControlLabel || '5+0'}</span>
                    <div>
                      <p className="text-chess-bright text-sm">
                        <span className="inline-block w-2 h-2 rounded-sm bg-white mr-1"></span>
                        {g.whitePlayer}
                      </p>
                      <p className="text-chess-text text-sm">
                        <span className="inline-block w-2 h-2 rounded-sm bg-gray-700 mr-1"></span>
                        {g.blackPlayer}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${won ? 'bg-green-900/50 text-green-400' : lost ? 'bg-red-900/50 text-red-400' : 'bg-gray-700/50 text-gray-300'}`}>
                      {won ? 'Won' : lost ? 'Lost' : 'Draw'}
                    </span>
                    <span className="text-chess-text text-xs">—</span>
                    <span className="text-chess-text text-xs">{g.endedAt ? new Date(g.endedAt).toLocaleDateString() : '—'}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-chess-text text-sm">No games yet. Start playing!</div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-[300px] bg-chess-card border-l border-chess-border p-4 space-y-4 overflow-y-auto">
        {/* Stats card */}
        <div className="border border-chess-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-chess-border">
            <h3 className="text-chess-bright font-bold">Stats</h3>
            <ChevronRight size={16} className="text-chess-text" />
          </div>
          <div className="divide-y divide-chess-border">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Gamepad2 size={14} className="text-chess-text" />
                <span className="text-chess-text text-sm">Games</span>
              </div>
              <span className="text-chess-bright font-bold text-sm">{user?.gamesPlayed || 0}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-green-400" />
                <span className="text-chess-text text-sm">Puzzles</span>
              </div>
              <span className="text-chess-bright font-bold text-sm">{user?.puzzlesSolved || 0}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚡</span>
                <span className="text-chess-text text-sm">Bullet</span>
              </div>
              <span className="text-chess-bright font-bold text-sm">{user?.blitzRating || 1200}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-green-400" />
                <span className="text-chess-text text-sm">Puzzles Rating</span>
              </div>
              <span className="text-chess-bright font-bold text-sm">{user?.puzzleRating || 1200}</span>
            </div>
          </div>
        </div>

        {/* Daily Puzzle */}
        <div className="border border-chess-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-chess-border">
            <h3 className="text-chess-bright font-bold">Daily Puzzle</h3>
            <ChevronRight size={16} className="text-chess-text" />
          </div>
          {daily ? (
            <div className="p-3">
              <div className="bg-chess-bg rounded-lg p-6 text-center mb-3">
                <div className="text-5xl mb-2">♞</div>
                <p className="text-chess-text text-xs">{daily.title} • Rating {daily.rating}</p>
              </div>
              <Link to="/puzzles" className="block w-full text-center bg-chess-accent hover:bg-chess-accent/80 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                Solve the Daily Puzzle
              </Link>
            </div>
          ) : (
            <div className="p-4 text-center text-chess-text text-sm">Loading...</div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="border border-chess-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-chess-border">
            <h3 className="text-chess-bright font-bold">Top Players</h3>
            <Link to="/leaderboard"><ChevronRight size={16} className="text-chess-text" /></Link>
          </div>
          <div className="divide-y divide-chess-border">
            {leaders.map((u: any, i: number) => (
              <div key={u.username} className="flex items-center gap-3 px-4 py-2 hover:bg-chess-hover">
                <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-chess-text'}`}>
                  {i + 1}
                </span>
                <span className="text-chess-bright text-sm flex-1">{u.username}</span>
                <span className="text-chess-accent font-bold text-sm">{u.blitzRating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
