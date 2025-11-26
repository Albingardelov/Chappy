import { create } from 'zustand'
import { getConversations } from '../../services/api'

const useConversationsStore = create((set, get) => ({
  conversations: [],
  loading: false,
  error: null,

  // Ladda konversationer från API
  loadConversations: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getConversations()
      set({ conversations: data, loading: false })
    } catch (error) {
      console.error('Kunde inte ladda konversationer:', error)
      set({ error: error.message || 'Kunde inte ladda konversationer', loading: false })
    }
  },

  // Uppdatera en specifik konversation (t.ex. efter att ha skickat meddelande)
  updateConversation: (conversationId, updates) => {
    const { conversations } = get()
    const updated = conversations.map(conv => {
      if (conv.id === conversationId && conv.type === updates.type) {
        return { ...conv, ...updates }
      }
      return conv
    })
    set({ conversations: updated })
  },

  // Lägg till en ny konversation (t.ex. efter att ha skapat kanal)
  addConversation: (conversation) => {
    const { conversations } = get()
    set({ conversations: [...conversations, conversation] })
  },

  // Ta bort en konversation (t.ex. efter att ha tagit bort kanal)
  removeConversation: (conversationId, type) => {
    const { conversations } = get()
    const filtered = conversations.filter(
      conv => !(conv.id === conversationId && conv.type === type)
    )
    set({ conversations: filtered })
  },

  // Rensa alla konversationer
  clearConversations: () => {
    set({ conversations: [], error: null })
  }
}))

export default useConversationsStore

