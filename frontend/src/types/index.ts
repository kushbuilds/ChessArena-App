export interface User {
  id: number
  username: string
  email?: string
  bio?: string
  country?: string
  avatarUrl?: string
  bulletRating: number
  blitzRating: number
  rapidRating: number
  classicalRating: number
  puzzleRating: number
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  gamesDraw: number
  puzzlesSolved: number
  isOnline: boolean
  createdAt: string
  lastSeen?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type GameStatus = 'ONGOING' | 'CHECKMATE' | 'STALEMATE' | 'DRAW' | 'RESIGNED' |
  'TIMEOUT' | 'DRAW_AGREED' | 'ABANDONED' | 'WAITING' | 'IN_CHECK' |
  'FIFTY_MOVE_RULE' | 'INSUFFICIENT_MATERIAL'

export interface GameState {
  gameId: number | null
  fen: string
  pgn: string
  status: GameStatus
  turn: 'white' | 'black'
  whiteTime: number
  blackTime: number
  whitePlayer: string
  blackPlayer: string
  whiteRating: number
  blackRating: number
  whiteRatingChange: number
  blackRatingChange: number
  playerColor: 'white' | 'black' | null
  lastMove: string | null
  legalMoves: string[]
  isInCheck: boolean
  winner: string | null
  resultReason: string | null
  isVsComputer: boolean
  timeControlLabel: string
}

export interface GameStateMessage {
  type: string
  gameId: number
  fen: string
  pgn: string
  lastMove: string
  status: string
  turn: string
  whiteTime: number
  blackTime: number
  winner: string | null
  resultReason: string | null
  whitePlayer: string
  blackPlayer: string
  whiteRating: number
  blackRating: number
  whiteRatingChange: number
  blackRatingChange: number
  legalMoves: string[]
  isInCheck: boolean
  message?: string
  senderUsername?: string
}

export interface ChatMessage {
  sender: string
  message: string
  timestamp: number
}

export interface Puzzle {
  id: number
  fen: string
  rating: number
  category: string
  title: string
  description: string
  timesAttempted: number
  timesSolved: number
}

export interface UserBasic {
  id: number
  username: string
  avatarUrl?: string
  blitzRating: number
  isOnline: boolean
  country?: string
}

export interface Friendship {
  id: number
  requester: UserBasic
  addressee: UserBasic
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED'
  createdAt: string
}

export interface GameHistoryItem {
  id: number
  whitePlayer: string
  blackPlayer: string
  whiteRating: number
  blackRating: number
  result: string
  status: string
  winner: string | null
  resultReason: string | null
  timeControl: string
  timeControlLabel: string
  pgn: string
  currentFen: string
  createdAt: string
  endedAt?: string
  isVsComputer: boolean
}
