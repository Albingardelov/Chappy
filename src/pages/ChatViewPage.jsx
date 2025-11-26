import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAuthStore from '../features/auth/useAuthStore'
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
  const [isChannelLocked, setIsChannelLocked] = useState(false)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Förhindra gäster från att komma åt DM-sidor
    if (type === 'dm' && user?.isGuest) {
      navigate('/chat')
      return
    }
    
    loadChatTitle()
    loadMessages(true) // Initial load
    
    // Automatisk uppdatering var 5:e sekund
    const interval = setInterval(() => {
      loadMessages(false) // Polling load
    }, 5000)
    
    // Rensa interval när komponenten unmountas
    return () => clearInterval(interval)
  }, [type, id, user, navigate])

  // Separata useEffect för att kontrollera låsta kanaler efter att isChannelLocked är satt
  useEffect(() => {
    if (type === 'channel' && user?.isGuest && isChannelLocked) {
      navigate('/chat')
    }
  }, [type, user, isChannelLocked, navigate])

  const loadChatTitle = async () => {
    try {
      if (type === 'channel') {
        // Hämta conversations för att få riktigt kanalnamn
        const conversations = await getConversations()
        const channel = conversations.find(conv => conv.type === 'channel' && conv.id === id)
        setChatTitle(channel ? channel.name : 'Kanal')
        setIsChannelLocked(channel?.isLocked || false)
      } else {
        setChatTitle(id) // Username för DM
        setIsChannelLocked(false)
      }
    } catch (error) {
      console.error('Kunde inte ladda chat-titel:', error)
      setChatTitle(type === 'channel' ? 'Kanal' : id)
      setIsChannelLocked(false)
    }
  }

  const loadMessages = async (isInitialLoad = false) => {
    // Förhindra gäster från att ladda meddelanden i låsta kanaler
    if (type === 'channel' && user?.isGuest && isChannelLocked) {
      return
    }
    
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
    
    // Gäster kan bara skicka meddelanden i kanaler, inte DM
    // (Detta borde inte hända eftersom gäster inte kan komma åt DM-sidan, men extra säkerhet)
    if (type === 'dm' && user.isGuest) {
      console.error('Guest user tried to send DM - this should not be possible')
      navigate('/chat')
      return
    }

    // Förhindra gäster från att skicka meddelanden i låsta kanaler
    if (type === 'channel' && user.isGuest) {
      const conversations = await getConversations()
      const channel = conversations.find(conv => conv.type === 'channel' && conv.id === id)
      if (channel?.isLocked) {
        console.error('Guest user tried to send message in locked channel')
        navigate('/chat')
        return
      }
    }

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
        {messages.map((message, index) => {
          const isOwn = message.senderId === user?.userId
          const prevMessage = index > 0 ? messages[index - 1] : null
          const isSameSender = prevMessage && prevMessage.senderId === message.senderId
          // Visa avsändare om det är första meddelandet från denna person, eller om det är en kanal (gruppchatt)
          const showSender = type === 'channel' && (!isSameSender || index === 0)
          
          return (
            <div 
              key={message.PK}
              className={isSameSender ? 'same-sender-group' : ''}
            >
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showSender={showSender}
                currentUsername={user?.username}
              />
            </div>
          )
        })}
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
          placeholder={
            user?.isGuest && isChannelLocked 
              ? 'Logga in för att skicka meddelanden i låsta kanaler' 
              : 'Skriv ett meddelande...'
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={user?.isGuest && isChannelLocked}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={user?.isGuest && isChannelLocked}
        >
          Skicka
        </button>
      </form>
    </div>
  )
}

export default ChatViewPage
