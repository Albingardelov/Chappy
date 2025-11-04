const API_BASE_URL = 'http://localhost:1337/api'

// Hjälpfunktion för att hämta token
const getToken = () => localStorage.getItem('token')

// Hjälpfunktion för att göra API-anrop
const apiCall = async (endpoint, options = {}) => {
  const token = getToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  return response.json()
}

// Auth endpoints
export const loginUser = async (username, password) => {
  return apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export const registerUser = async (username, email, password) => {
  return apiCall('/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  })
}

// Conversations endpoints
export const getConversations = async () => {
  return apiCall('/conversations')
}

// Channels endpoints
export const getChannels = async () => {
  return apiCall('/channels')
}

export const createChannel = async (name, description, isLocked) => {
  return apiCall('/channels', {
    method: 'POST',
    body: JSON.stringify({ name, description, isLocked })
  })
}

export const deleteChannel = async (channelId) => {
  return apiCall(`/channels/${channelId}`, {
    method: 'DELETE'
  })
}

export const getChannelMessages = async (channelId) => {
  return apiCall(`/channels/${channelId}/messages`)
}

export const sendChannelMessage = async (channelId, content, senderId) => {
  return apiCall(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, senderId })
  })
}

// DM endpoints
export const getDMMessages = async (username) => {
  return apiCall(`/dm/${username}`)
}

export const sendDMMessage = async (recipientUsername, content) => {
  return apiCall('/dm', {
    method: 'POST',
    body: JSON.stringify({ recipientUsername, content })
  })
}

// User endpoints
export const deleteUser = async () => {
  return apiCall('/users', {
    method: 'DELETE'
  })
}
