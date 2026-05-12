import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e: Record<string,string> = {}
    if (form.username.length < 3) e.username = 'At least 3 characters'
    if (form.username.length > 20) e.username = 'At most 20 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email'
    if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/play')
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' })
    } finally { setLoading(false) }
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-chess-text mb-1">{label}</label>
      <input type={type} value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className={`input ${errors[key] ? 'border-chess-red' : ''}`}
        placeholder={placeholder} />
      {errors[key] && <p className="text-chess-red text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">♟</div>
          <h1 className="text-3xl font-bold text-chess-bright">Create account</h1>
          <p className="text-chess-text mt-1">Join ChessArena — it's free!</p>
        </div>
        <div className="card">
          {errors.general && <div className="bg-chess-red/20 border border-chess-red text-chess-red rounded px-3 py-2 text-sm mb-4">{errors.general}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('username', 'Username', 'text', 'Choose a username')}
            {field('email', 'Email', 'email', 'your@email.com')}
            {field('password', 'Password', 'password', 'At least 6 characters')}
            {field('confirm', 'Confirm Password', 'password', 'Repeat your password')}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-chess-text text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-chess-accent hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
