import React from 'react'
import { Link } from 'react-router-dom'

interface PlayerCardProps {
  username: string
  rating: number
  ratingChange?: number
  isOnline?: boolean
  avatarUrl?: string
  country?: string
  color: 'white' | 'black'
}

export default function PlayerCard({ username, rating, ratingChange, isOnline, avatarUrl, country, color }: PlayerCardProps) {
  const pieceSymbol = color === 'white' ? '♔' : '♚'
  const ratingColor = !ratingChange ? '' : ratingChange > 0 ? 'text-chess-accent' : 'text-chess-red'

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-full bg-chess-border flex items-center justify-center text-xl overflow-hidden shrink-0">
        {avatarUrl ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" /> : <span>{pieceSymbol}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${username}`} className="font-semibold text-chess-bright hover:text-chess-accent truncate">
            {username}
          </Link>
          {isOnline && <div className="w-2 h-2 rounded-full bg-chess-accent shrink-0" />}
        </div>
        <div className="flex items-center gap-2 text-sm text-chess-text">
          <span>{rating}</span>
          {ratingChange !== undefined && ratingChange !== 0 && (
            <span className={`text-xs font-medium ${ratingColor}`}>
              {ratingChange > 0 ? '+' : ''}{ratingChange}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
