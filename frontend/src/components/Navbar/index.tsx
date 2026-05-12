import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, ChevronDown, User, Users, LogOut, Trophy } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="bg-chess-navbar border-b border-chess-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-chess-accent font-bold text-xl">
          <span className="text-2xl">♟</span>
          <span>ChessArena</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-chess-text">
          <Link to="/play" className="hover:text-chess-bright transition-colors">Play</Link>
          <Link to="/puzzles" className="hover:text-chess-bright transition-colors">Puzzles</Link>
          <Link to="/leaderboard" className="hover:text-chess-bright transition-colors">Leaderboard</Link>
          <Link to="/analysis" className="hover:text-chess-bright transition-colors">Analysis</Link>
        </div>

        {/* Auth section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 text-chess-bright hover:text-white transition-colors bg-chess-card rounded px-3 py-1.5 border border-chess-border">
                <div className="w-2 h-2 rounded-full bg-chess-accent"></div>
                <span className="font-medium">{user.username}</span>
                <span className="text-chess-text text-xs">{user.blitzRating}</span>
                <ChevronDown size={14} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-chess-card border border-chess-border rounded shadow-lg z-50">
                  <Link to={`/profile/${user.username}`} onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-chess-hover text-chess-text hover:text-chess-bright">
                    <User size={14} /> Profile
                  </Link>
                  <Link to="/friends" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-chess-hover text-chess-text hover:text-chess-bright">
                    <Users size={14} /> Friends
                  </Link>
                  <div className="border-t border-chess-border my-1" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-chess-hover text-chess-red">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-chess-text hover:text-chess-bright text-sm font-medium transition-colors">Log In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-1.5">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-chess-text" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-chess-card border-t border-chess-border px-4 py-3 space-y-2">
          {['play','puzzles','leaderboard','analysis'].map(p => (
            <Link key={p} to={`/${p}`} onClick={() => setMenuOpen(false)}
              className="block py-2 text-chess-text hover:text-chess-bright capitalize">{p}</Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to={`/profile/${user?.username}`} onClick={() => setMenuOpen(false)} className="block py-2 text-chess-text">Profile</Link>
              <button onClick={handleLogout} className="block py-2 text-chess-red">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-chess-text">Log In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2 text-chess-accent font-medium">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
