import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { wsService } from '../../services/websocket'
import { gameApi } from '../../services/api'
import ChessBoardComponent from '../../components/ChessBoard'
import Timer from '../../components/Timer'
import PlayerCard from '../../components/PlayerCard'
import MoveHistory from '../../components/MoveHistory'
import GameControls from '../../components/GameControls'
import GameResult from '../../components/GameResult'
import ChatBox from '../../components/ChatBox'
import { GameStateMessage } from '../../types'

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { user, token, isAuthenticated } = useAuth()
  const { gameState, setGameState, chatMessages, joinGame, leaveGame, makeMove, resign, offerDraw, acceptDraw, sendMessage, updateFromMessage } = useGame()
  const navigate = useNavigate()
  const [flipped, setFlipped] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [connected, setConnected] = useState(false)

  const id = parseInt(gameId!)

  useEffect(() => {
    if (!token) return

    // Load game state immediately (don't wait for WebSocket)
    gameApi.getGame(id).then(data => {
      const playerColor: 'white' | 'black' = data.whitePlayer === user?.username ? 'white'
        : data.blackPlayer === user?.username ? 'black' : 'white'
      setGameState({
        gameId: id,
        fen: data.currentFen,
        pgn: data.pgn || '',
        status: data.status,
        turn: data.currentFen.split(' ')[1] === 'w' ? 'white' : 'black',
        whiteTime: data.whiteTime,
        blackTime: data.blackTime,
        whitePlayer: data.whitePlayer,
        blackPlayer: data.blackPlayer,
        whiteRating: data.whiteRating,
        blackRating: data.blackRating,
        whiteRatingChange: 0, blackRatingChange: 0,
        playerColor, lastMove: null,
        legalMoves: data.legalMoves || [],
        isInCheck: data.isInCheck || false,
        winner: data.winner, resultReason: data.resultReason,
        isVsComputer: data.isVsComputer,
        timeControlLabel: data.timeControlLabel || '5+0',
        })
        joinGame(id, playerColor, data.isVsComputer)
      }).catch(console.error)

    // Connect WebSocket separately
    wsService.connect(token, () => { setConnected(true) }, console.error)
    return () => { leaveGame() }
  }, [id, token])

  // Show result modal when game ends
  useEffect(() => {
    const over = ['CHECKMATE','STALEMATE','DRAW','RESIGNED','TIMEOUT','DRAW_AGREED',
      'INSUFFICIENT_MATERIAL','FIFTY_MOVE_RULE'].includes(gameState.status)
    if (over) setShowResult(true)
  }, [gameState.status])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!gameState.playerColor) return false
    const isTurn = gameState.turn === gameState.playerColor
    if (!isTurn) return false
    makeMove(from, to, promotion)
    return true
  }, [gameState.turn, gameState.playerColor, makeMove])

  const isActive = (c: 'white' | 'black') =>
    (gameState.status === 'ONGOING' || gameState.status === 'IN_CHECK') && gameState.turn === c

  const orientation = flipped
    ? (gameState.playerColor === 'white' ? 'black' : 'white')
    : (gameState.playerColor || 'white')

  const opponent = orientation === 'white' ? 'black' : 'white'
  const opponentName = opponent === 'white' ? gameState.whitePlayer : gameState.blackPlayer
  const myName     = orientation === 'white' ? gameState.whitePlayer : gameState.blackPlayer
  const opTime = opponent === 'white' ? gameState.whiteTime : gameState.blackTime
  const myTime = orientation === 'white' ? gameState.whiteTime : gameState.blackTime

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 md:p-4">
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl">

        {/* Board */}
        <div className="flex-1 flex flex-col items-center">
          {/* Opponent info + timer */}
          <div className="w-full max-w-[600px] flex items-center justify-between mb-2">
            <PlayerCard username={opponentName} rating={opponent === 'white' ? gameState.whiteRating : gameState.blackRating}
              color={opponent} />
            <Timer timeMs={opTime} isActive={isActive(opponent)} color={opponent} />
          </div>

          <div className="w-full max-w-[600px]">
            <ChessBoardComponent
              fen={gameState.fen}
              onMove={handleMove}
              orientation={orientation}
              legalMoves={gameState.legalMoves}
              lastMove={gameState.lastMove}
              isInCheck={gameState.isInCheck}
              gameStatus={gameState.status}
              isPlayerTurn={gameState.turn === gameState.playerColor && (gameState.status === 'ONGOING' || gameState.status === 'IN_CHECK')}
            />
          </div>

          {/* Player info + timer */}
          <div className="w-full max-w-[600px] flex items-center justify-between mt-2">
            <PlayerCard username={myName || user?.username || 'You'} rating={orientation === 'white' ? gameState.whiteRating : gameState.blackRating}
              color={orientation} />
            <Timer timeMs={myTime} isActive={isActive(orientation)} color={orientation} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-3">
          <MoveHistory pgn={gameState.pgn} />

          <GameControls
            onResign={resign}
            onOfferDraw={offerDraw}
            onFlipBoard={() => setFlipped(!flipped)}
            onRematch={() => navigate('/play')}
            onNewGame={() => navigate('/play')}
            onAnalyze={() => navigate(`/analysis/${id}`)}
            canResign={gameState.status === 'ONGOING' || gameState.status === 'IN_CHECK'}
            canOfferDraw={(gameState.status === 'ONGOING' || gameState.status === 'IN_CHECK') && !gameState.isVsComputer}
            gameStatus={gameState.status}
          />

          {/* Chat */}
          {!gameState.isVsComputer && (
            <div className="card">
              <button onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 text-chess-text hover:text-chess-bright text-sm w-full">
                <MessageCircle size={16} /> Chat
                {chatMessages.length > 0 && <span className="ml-auto bg-chess-accent text-white text-xs rounded-full px-1.5">{chatMessages.length}</span>}
              </button>
              {showChat && (
                <div className="mt-2 h-48">
                  <ChatBox messages={chatMessages} onSend={sendMessage} currentUsername={user?.username || ''} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <GameResult
        isVisible={showResult}
        winner={gameState.winner}
        status={gameState.status}
        resultReason={gameState.resultReason}
        playerColor={gameState.playerColor}
        whitePlayer={gameState.whitePlayer}
        blackPlayer={gameState.blackPlayer}
        whiteRatingChange={gameState.whiteRatingChange}
        blackRatingChange={gameState.blackRatingChange}
        onRematch={() => { setShowResult(false); navigate('/play') }}
        onNewGame={() => { setShowResult(false); navigate('/play') }}
        onAnalyze={() => { setShowResult(false); navigate(`/analysis/${id}`) }}
        onClose={() => setShowResult(false)}
      />
    </div>
  )
}
