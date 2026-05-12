import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/play')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">♟</div>
          <h1 className="text-3xl font-bold text-chess-bright">Welcome back</h1>
          <p className="text-chess-text mt-1">Sign in to your ChessArena account</p>
        </div>
        <div className="card">
          {error && <div className="bg-chess-red/20 border border-chess-red text-chess-red rounded px-3 py-2 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-chess-text mb-1">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)}
                className="input" placeholder="Enter your username" required autoFocus />
            </div>
            <div>
              <label className="block text-sm text-chess-text mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input" placeholder="Enter your password" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
          <p className="text-center text-chess-text text-sm mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-chess-accent hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
