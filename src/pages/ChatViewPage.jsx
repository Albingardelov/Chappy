import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { getChannelMessages, getDMMessages, sendChannelMessage, sendDMMessage, getConversations } from '../services/api'
import MessageBubble from '../components/MessageBubble'
import './ChatViewPage.css'

function ChatViewPage() {
  const { type, id } = useParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatTitle, setChatTitle] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadMessages(true) // Initial load
    loadChatTitle()
    
    // Automatisk uppdatering var 5:e sekund
    const interval = setInterval(() => {
      loadMessages(false) // Polling load
    }, 5000)
    
    // Rensa interval när komponenten unmountas
    return () => clearInterval(interval)
  }, [type, id])

  const loadChatTitle = async () => {
    try {
      if (type === 'channel') {
        // Hämta conversations för att få riktigt kanalnamn
        const conversations = await getConversations()
        const channel = conversations.find(conv => conv.type === 'channel' && conv.id === id)
        setChatTitle(channel ? channel.name : 'Kanal')
      } else {
        setChatTitle(id) // Username för DM
      }
    } catch (error) {
      console.error('Kunde inte ladda chat-titel:', error)
      setChatTitle(type === 'channel' ? 'Kanal' : id)
    }
  }

  const loadMessages = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
      } else {
        setLoadingMessages(true)
      }
      
      let data = []
      
      if (type === 'channel') {
        data = await getChannelMessages(id)
      } else if (type === 'dm') {
        data = await getDMMessages(id)
      }
      
      setMessages(data)
    } catch (error) {
      console.error('Kunde inte ladda meddelanden:', error)
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      } else {
        setLoadingMessages(false)
      }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const messageText = newMessage.trim()
    setNewMessage('') // Rensa input direkt för bättre UX

    try {
      if (type === 'channel') {
        await sendChannelMessage(id, messageText, user.userId)
      } else if (type === 'dm') {
        await sendDMMessage(id, messageText)
      }
      
      // Ladda om meddelanden efter att ha skickat
      loadMessages()
    } catch (error) {
      console.error('Kunde inte skicka meddelande:', error)
      // Återställ meddelandet om det misslyckades
      setNewMessage(messageText)
    }
  }

  // Scrolla till botten när meddelanden uppdateras
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  if (loading) {
    return (
      <div className="chat-view">
        <div className="loading">Laddar meddelanden...</div>
      </div>
    )
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/chat')}>
          ←
        </button>
        <div className="chat-title">
          {chatTitle}
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble
            key={message.PK}
            message={message}
            isOwn={message.senderId === user?.userId}
          />
        ))}
        {loadingMessages && (
          <div className="loading-indicator">
            <div className="loading-dots">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Skriv ett meddelande..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-button">
          Skicka
        </button>
      </form>
    </div>
  )
}

export default ChatViewPage
