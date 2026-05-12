import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { puzzleApi, leaderboardApi } from '../../services/api'


import { Puzzle } from '../../types'
import { Zap, Brain, Trophy, Users, ChevronRight } from 'lucide-react'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [daily, setDaily] = useState<Puzzle | null>(null)
  const [leaders, setLeaders] = useState<any[]>([])

  useEffect(() => {
    puzzleApi.getDailyPuzzle().then(setDaily).catch(() => {})
    leaderboardApi.getLeaderboard('blitz').then(d => setLeaders(d.slice(0,5))).catch(() => {})
  }, [])

  const features = [
    { icon: <Zap className="text-chess-yellow" size={28} />, title: 'Play Online', desc: 'Challenge players from around the world in real-time', link: '/play' },
    { icon: <Brain className="text-chess-blue" size={28} />, title: 'Solve Puzzles', desc: 'Sharpen your tactics with thousands of puzzles', link: '/puzzles' },
    { icon: <Trophy className="text-chess-accent" size={28} />, title: 'Leaderboard', desc: 'See the top players and compete for the top spot', link: '/leaderboard' },
    { icon: <Users className="text-purple-400" size={28} />, title: 'Play Computer', desc: 'Practice against the built-in chess engine', link: '/play' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-chess-card to-chess-bg py-20 px-4 text-center">
        <div className="text-7xl mb-6">♟</div>
        <h1 className="text-5xl font-bold text-chess-bright mb-4">Play Chess Online</h1>
        <p className="text-chess-text text-xl mb-10 max-w-xl mx-auto">
          The best place to play free chess online. Instant play, no downloads required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/play" className="btn-primary text-lg px-8 py-3 rounded-lg">
            {isAuthenticated ? 'Play Now' : 'Play for Free'}
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn-secondary text-lg px-8 py-3 rounded-lg">
              Create Account
            </Link>
          )}
        </div>
        {isAuthenticated && user && (
          <div className="mt-8 inline-flex items-center gap-3 bg-chess-card border border-chess-border rounded-lg px-5 py-3">
            <div className="w-2 h-2 rounded-full bg-chess-accent" />
            <span className="text-chess-bright font-medium">{user.username}</span>
            <span className="text-chess-text">·</span>
            <span className="text-chess-text">Blitz {user.blitzRating}</span>
          </div>
        )}
      </div>

      {/* Features grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <Link key={f.title} to={f.link}
              className="card hover:border-chess-accent transition-colors group text-center p-5">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-semibold text-chess-bright mb-1 group-hover:text-chess-accent transition-colors">{f.title}</h3>
              <p className="text-chess-text text-xs">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Daily puzzle + leaderboard */}
      <div className="max-w-6xl mx-auto px-4 pb-16 grid md:grid-cols-2 gap-6">
        {/* Daily puzzle */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-chess-bright font-bold text-lg">🧩 Daily Puzzle</h2>
            <Link to="/puzzles" className="text-chess-accent text-sm hover:underline flex items-center gap-1">
              All puzzles <ChevronRight size={14} />
            </Link>
          </div>
          {daily ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-chess-text text-sm">{daily.title}</span>
                <span className="bg-chess-bg border border-chess-border px-2 py-0.5 rounded text-xs text-chess-text">
                  Rating {daily.rating}
                </span>
              </div>
              <div className="bg-chess-bg rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">♟</div>
                <p className="text-chess-text text-sm">{daily.description || 'Find the best move!'}</p>
              </div>
              <Link to="/puzzles" className="btn-primary w-full mt-3 text-center block py-2 text-sm">
                Solve Puzzle
              </Link>
            </div>
          ) : (
            <div className="text-chess-text text-sm text-center py-8">Loading daily puzzle...</div>
          )}
        </div>

        {/* Leaderboard preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-chess-bright font-bold text-lg">🏆 Leaderboard</h2>
            <Link to="/leaderboard" className="text-chess-accent text-sm hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {leaders.length > 0 ? (
            <div className="space-y-2">
              {leaders.map((u: any, i: number) => (
                <Link key={u.username} to={`/profile/${u.username}`}
                  className="flex items-center gap-3 p-2 rounded hover:bg-chess-hover transition-colors">
                  <span className={`text-sm font-bold w-6 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-chess-text'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-chess-bright font-medium text-sm">{u.username}</span>
                  </div>
                  <span className="text-chess-accent font-bold text-sm">{u.blitzRating}</span>
                  {u.isOnline && <div className="w-2 h-2 rounded-full bg-chess-accent" />}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-chess-text text-sm text-center py-8">Loading leaderboard...</div>
          )}
        </div>
      </div>
    </div>
  )
}