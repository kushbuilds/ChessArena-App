import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Gamepad2, Puzzle, GraduationCap, ChevronDown, Search, Settings, Users, LogOut, User } from 'lucide-react'

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const navItems = [
    { icon: <Gamepad2 size={20} />, label: 'Play', path: '/play' },
    { icon: <Puzzle size={20} />, label: 'Puzzles', path: '/puzzles' },
    { icon: <GraduationCap size={20} />, label: 'Learn', path: '/learn' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-[70px] xl:w-[180px] bg-chess-navbar border-r border-chess-border h-screen sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-4 py-4 text-chess-accent font-bold">
        <span className="text-2xl">♟</span>
        <span className="hidden xl:inline text-lg">ChessArena</span>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-1 mt-2">
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${active ? 'bg-chess-hover text-chess-accent' : 'text-chess-text hover:text-chess-bright hover:bg-chess-hover'}`}>
              {item.icon}
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          )
        })}
        <button onClick={() => setMoreOpen(!moreOpen)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-chess-text hover:text-chess-bright hover:bg-chess-hover w-full">
          <ChevronDown size={20} className={moreOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          <span className="hidden xl:inline">More</span>
        </button>
        {moreOpen && (
          <div className="pl-2 space-y-1">
            <Link to="/leaderboard" className="flex items-center gap-3 px-3 py-2 rounded text-sm text-chess-text hover:text-chess-bright hover:bg-chess-hover">
              <span className="hidden xl:inline">Leaderboard</span>
              <span className="xl:hidden text-xs">🏆</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-4 space-y-2 border-t border-chess-border pt-3">
        <Link to="/search" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-chess-text hover:text-chess-bright hover:bg-chess-hover">
          <Search size={18} />
          <span className="hidden xl:inline">Search</span>
        </Link>
        {isAuthenticated && user ? (
          <>
            <Link to={`/profile/${user.username}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-chess-text hover:text-chess-bright hover:bg-chess-hover">
              <div className="w-6 h-6 rounded-full bg-chess-accent flex items-center justify-center text-white text-xs font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <span className="hidden xl:inline font-medium">{user.username}</span>
            </Link>
            <div className="hidden xl:flex items-center gap-2 px-3">
              <Link to="/friends" className="text-chess-text hover:text-chess-bright"><Users size={16} /></Link>
              <Link to="/settings" className="text-chess-text hover:text-chess-bright"><Settings size={16} /></Link>
              <button onClick={() => { logout(); navigate('/') }} className="text-chess-text hover:text-red-400"><LogOut size={16} /></button>
            </div>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-chess-text hover:text-chess-bright hover:bg-chess-hover">
            <User size={18} />
            <span className="hidden xl:inline">Log In</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
