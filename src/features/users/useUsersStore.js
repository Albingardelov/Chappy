import { create } from 'zustand'
import { getUsers } from '../../services/api'

const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  // Ladda användare från API
  loadUsers: async () => {
    set({ loading: true, error: null })
    try {
      const users = await getUsers()
      set({ users, loading: false })
    } catch (error) {
      console.error('Kunde inte ladda användare:', error)
      set({ error: error.message || 'Kunde inte ladda användare', loading: false, users: [] })
    }
  },

  // Rensa användarlistan
  clearUsers: () => {
    set({ users: [], error: null })
  }
}))

export default useUsersStore

