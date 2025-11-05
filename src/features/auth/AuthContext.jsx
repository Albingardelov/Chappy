import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser } from '../../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kontrollera om användaren är inloggad vid sidladdning
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    if (token && username) {
      try {
        // Dekoda JWT för att få userId
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userId = payload.userId
        setUser({ token, username, userId })
      } catch (error) {
        // Om token är ogiltig, ta bort den
        localStorage.removeItem('token')
        localStorage.removeItem('username')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await loginUser(username, password)
      const { token } = response
      
      // Dekoda JWT för att få userId
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId
      
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      setUser({ token, username, userId })
      
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await registerUser(username, email, password)
      const { token } = response
      
      // Dekoda JWT för att få userId
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId
      
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      setUser({ token, username, userId })
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

