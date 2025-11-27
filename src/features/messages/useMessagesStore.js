import { create } from 'zustand'
import { getChannelMessages, getDMMessages } from '../../services/api'

const useMessagesStore = create((set, get) => ({
  // Struktur: { 'channel:channelId': [...messages], 'dm:username': [...messages] }
  messagesByConversation: {},
  loading: {},
  errors: {},

  // Ladda meddelanden för en konversation
  loadMessages: async (type, id, isInitialLoad = false) => {
    const key = `${type}:${id}`
    
    if (isInitialLoad) {
      set((state) => ({
        loading: { ...state.loading, [key]: true },
        errors: { ...state.errors, [key]: null }
      }))
    }

    try {
      let data = []
      
      if (type === 'channel') {
        data = await getChannelMessages(id)
      } else if (type === 'dm') {
        data = await getDMMessages(id)
      }
      
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [key]: data
        },
        loading: { ...state.loading, [key]: false },
        errors: { ...state.errors, [key]: null }
      }))
    } catch (error) {
      console.error('Kunde inte ladda meddelanden:', error)
      set((state) => ({
        loading: { ...state.loading, [key]: false },
        errors: { ...state.errors, [key]: error.message || 'Kunde inte ladda meddelanden' }
      }))
    }
  },

  // Hämta meddelanden för en specifik konversation
  getMessages: (type, id) => {
    const key = `${type}:${id}`
    return get().messagesByConversation[key] || []
  },

  // Hämta loading state för en konversation
  getLoading: (type, id) => {
    const key = `${type}:${id}`
    return get().loading[key] || false
  },

  // Lägg till ett nytt meddelande (efter att ha skickat)
  addMessage: (type, id, message) => {
    const key = `${type}:${id}`
    const currentMessages = get().getMessages(type, id)
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [key]: [...currentMessages, message]
      }
    }))
  },

  // Rensa meddelanden för en konversation
  clearMessages: (type, id) => {
    const key = `${type}:${id}`
    set((state) => {
      const newMessages = { ...state.messagesByConversation }
      delete newMessages[key]
      const newLoading = { ...state.loading }
      delete newLoading[key]
      const newErrors = { ...state.errors }
      delete newErrors[key]
      return {
        messagesByConversation: newMessages,
        loading: newLoading,
        errors: newErrors
      }
    })
  },

  // Rensa alla meddelanden
  clearAllMessages: () => {
    set({
      messagesByConversation: {},
      loading: {},
      errors: {}
    })
  }
}))

export default useMessagesStore

