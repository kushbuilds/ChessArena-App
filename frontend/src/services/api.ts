import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('chess_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('chess_token')
      localStorage.removeItem('chess_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }).then(r => r.data),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }).then(r => r.data),
}

export const userApi = {
  getProfile: (username: string) =>
    api.get(`/users/${username}`).then(r => r.data),
  searchUsers: (q: string) =>
    api.get('/users/search', { params: { q } }).then(r => r.data),
  updateProfile: (data: any) =>
    api.put('/users/profile', data).then(r => r.data),
  getFriends: () =>
    api.get('/users/friends').then(r => r.data),
  sendFriendRequest: (username: string) =>
    api.post(`/users/friends/${username}`).then(r => r.data),
  acceptFriendRequest: (id: number) =>
    api.put(`/users/friends/${id}/accept`).then(r => r.data),
  removeFriend: (id: number) =>
    api.delete(`/users/friends/${id}`).then(r => r.data),
  getPendingRequests: () =>
    api.get('/users/friends/pending').then(r => r.data),
}

export const gameApi = {
  createGame: (req: any) =>
    api.post('/games/create', req).then(r => r.data),
  getGame: (gameId: number) =>
    api.get(`/games/${gameId}`).then(r => r.data),
  getGameHistory: (username: string) =>
    api.get(`/games/history/${username}`).then(r => r.data),
}

export const puzzleApi = {
  getDailyPuzzle: () =>
    api.get('/puzzles/daily').then(r => r.data),
  getRandomPuzzle: () =>
    api.get('/puzzles/random').then(r => r.data),
  getPuzzleById: (id: number) =>
    api.get(`/puzzles/${id}`).then(r => r.data),
  submitAttempt: (id: number, moves: string, timeSpent: number) =>
    api.post(`/puzzles/${id}/attempt`, { puzzleId: id, moves, timeSpentSeconds: timeSpent }).then(r => r.data),
  getPuzzlesByCategory: (category: string) =>
    api.get(`/puzzles/category/${category}`).then(r => r.data),
}

export const leaderboardApi = {
  getLeaderboard: (category = 'blitz') =>
    api.get(`/leaderboard/${category}`).then(r => r.data),
}

export default api
