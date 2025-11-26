import { create } from 'zustand'
import { loginUser, registerUser } from '../../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  // Initialize auth state from localStorage
  initialize: () => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    if (token && username) {
      try {
        // Dekoda JWT för att få userId
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userId = payload.userId
        set({ user: { token, username, userId }, loading: false })
      } catch (error) {
        // Om token är ogiltig, ta bort den
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        set({ user: null, loading: false })
      }
    } else {
      set({ loading: false })
    }
  },

  login: async (username, password) => {
    try {
      const response = await loginUser(username, password)
      const { token } = response
      
      // Dekoda JWT för att få userId
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId
      
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      set({ user: { token, username, userId } })
      
      return response
    } catch (error) {
      throw error
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await registerUser(username, email, password)
      const { token } = response
      
      // Dekoda JWT för att få userId
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId
      
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      set({ user: { token, username, userId } })
      
      return response
    } catch (error) {
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    set({ user: null })
  },

  enterAsGuest: () => {
    // Generera ett unikt gäst-ID
    const guestId = 'GUEST_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    set({ 
      user: { 
        username: 'Gäst', 
        userId: guestId,
        isGuest: true 
      } 
    })
  }
}))

export default useAuthStore

