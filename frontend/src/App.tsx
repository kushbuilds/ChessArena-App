import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GameProvider } from './context/GameContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Play from './pages/Play'
import Game from './pages/Game'
import Puzzles from './pages/Puzzles'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <div className="min-h-screen bg-chess-bg text-chess-text">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/play" element={<Play />} />
              <Route path="/game/:id" element={<Game />} />
              <Route path="/puzzles" element={<Puzzles />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}