import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { wsService } from '../services/websocket'
import { gameApi } from '../services/api'
import { GameState, GameStateMessage, ChatMessage } from '../types'

const defaultState: GameState = {
  gameId: null, fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn: '', status: 'WAITING', turn: 'white',
  whiteTime: 300000, blackTime: 300000,
  whitePlayer: '', blackPlayer: '', whiteRating: 1200, blackRating: 1200,
  whiteRatingChange: 0, blackRatingChange: 0,
  playerColor: null, lastMove: null, legalMoves: [],
  isInCheck: false, winner: null, resultReason: null,
  isVsComputer: false, timeControlLabel: '5+0',
}

interface GameContextType {
  gameState: GameState
  chatMessages: ChatMessage[]
  setGameState: (s: GameState) => void
  joinGame: (gameId: number, playerColor: 'white' | 'black', isVsComputer?: boolean) => void
  leaveGame: () => void
  makeMove: (from: string, to: string, promotion?: string) => void
  resign: () => void
  offerDraw: () => void
  acceptDraw: () => void
  sendMessage: (text: string) => void
  updateFromMessage: (msg: GameStateMessage) => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultState)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const updateFromMessage = useCallback((msg: GameStateMessage) => {
    setGameState(prev => ({
      ...prev,
      fen: msg.fen ?? prev.fen,
      pgn: msg.pgn ?? prev.pgn,
      status: msg.status as any ?? prev.status,
      turn: (msg.turn as 'white' | 'black') ?? prev.turn,
      whiteTime: msg.whiteTime ?? prev.whiteTime,
      blackTime: msg.blackTime ?? prev.blackTime,
      lastMove: msg.lastMove ?? prev.lastMove,
      legalMoves: msg.legalMoves ?? prev.legalMoves,
      isInCheck: msg.isInCheck ?? prev.isInCheck,
      winner: msg.winner ?? prev.winner,
      resultReason: msg.resultReason ?? prev.resultReason,
      whiteRating: msg.whiteRating ?? prev.whiteRating,
      blackRating: msg.blackRating ?? prev.blackRating,
      whiteRatingChange: msg.whiteRatingChange ?? prev.whiteRatingChange,
      blackRatingChange: msg.blackRatingChange ?? prev.blackRatingChange,
    }))
  }, [])

  const joinGame = useCallback((gameId: number, playerColor: 'white' | 'black', isVsComputer = false) => {
    setGameState(prev => ({ ...prev, gameId, playerColor, isVsComputer }))

    wsService.subscribe(`/topic/game/${gameId}`, (msg: GameStateMessage) => {
      if (msg.type === 'CHAT') return
      updateFromMessage(msg)
    })
    wsService.subscribe(`/topic/game/${gameId}/chat`, (msg: any) => {
      setChatMessages(prev => [...prev, {
        sender: msg.senderUsername || 'Unknown',
        message: msg.message || '',
        timestamp: Date.now(),
      }])
    })
  }, [updateFromMessage])

  const leaveGame = useCallback(() => {
    if (gameState.gameId) {
      wsService.unsubscribe(`/topic/game/${gameState.gameId}`)
      wsService.unsubscribe(`/topic/game/${gameState.gameId}/chat`)
    }
    setGameState(defaultState)
    setChatMessages([])
  }, [gameState.gameId])

  const makeMove = useCallback((from: string, to: string, promotion?: string) => {
    if (!gameState.gameId) return
    wsService.send('/app/game/move', { gameId: gameState.gameId, from, to, promotion: promotion || null })
  }, [gameState.gameId])

  const resign = useCallback(() => {
    if (!gameState.gameId) return
    wsService.send('/app/game/resign', { gameId: gameState.gameId })
  }, [gameState.gameId])

  const offerDraw = useCallback(() => {
    if (!gameState.gameId) return
    wsService.send('/app/game/draw-offer', { gameId: gameState.gameId })
  }, [gameState.gameId])

  const acceptDraw = useCallback(() => {
    if (!gameState.gameId) return
    wsService.send('/app/game/draw-accept', { gameId: gameState.gameId })
  }, [gameState.gameId])

  const sendMessage = useCallback((text: string) => {
    if (!gameState.gameId || !text.trim()) return
    wsService.send('/app/game/message', { gameId: gameState.gameId, message: text })
  }, [gameState.gameId])

  return (
    <GameContext.Provider value={{
      gameState, chatMessages, setGameState,
      joinGame, leaveGame, makeMove, resign, offerDraw, acceptDraw, sendMessage, updateFromMessage,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
