import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { getConversations, createChannel, deleteChannel, deleteUser } from '../services/api'
import ConversationItem from '../components/ConversationItem'
import { getInitials, getColorFromName } from '../utils/initials'
import './ChatOverviewPage.css'

function ChatOverviewPage() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDeleteChannel, setShowDeleteChannel] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelLocked, setNewChannelLocked] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Kunde inte ladda konversationer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Är du säker på att du vill ta bort ditt konto? Detta kan inte ångras.')) {
      try {
        await deleteUser()
        logout()
        navigate('/')
        alert('Ditt konto har tagits bort.')
      } catch (error) {
        console.error('Kunde inte ta bort konto:', error)
        alert('Kunde inte ta bort kontot. Försök igen.')
      }
    }
  }

  const handleCreateChannel = async (e) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    try {
      await createChannel(newChannelName, newChannelDescription, newChannelLocked)
      setNewChannelName('')
      setNewChannelDescription('')
      setNewChannelLocked(false)
      setShowCreateChannel(false)
      loadConversations() // Reload conversations
    } catch (error) {
      console.error('Kunde inte skapa kanal:', error)
    }
  }

  const handleDeleteChannelClick = (channelId) => {
    const channel = conversations.find(conv => conv.type === 'channel' && conv.id === channelId)
    setChannelToDelete(channel)
    setDeleteError('') // Rensa eventuella tidigare fel
    setShowDeleteChannel(true)
  }

  const handleConfirmDeleteChannel = async () => {
    if (!channelToDelete) return

    try {
      await deleteChannel(channelToDelete.id)
      setShowDeleteChannel(false)
      setChannelToDelete(null)
      setDeleteError('')
      loadConversations() // Reload conversations
    } catch (error) {
      console.error('Kunde inte ta bort kanal:', error)
      setDeleteError('Kunde inte ta bort kanalen. Kontrollera att du är skaparen av kanalen.')
    }
  }

  const handleConversationClick = (conversation) => {
    navigate(`/chat/${conversation.type}/${conversation.id}`)
  }

  if (loading) {
    return (
      <div className="chat-overview">
        <div className="loading">Laddar konversationer...</div>
      </div>
    )
  }

  return (
    <div className="chat-overview">
      <div className="chat-header">
        <div className="header-left">
          {user && !user.isGuest ? (
            <div 
              className="profile-avatar clickable"
              onClick={() => setShowProfileModal(true)}
              title="Profilinställningar"
              style={{ backgroundColor: getColorFromName(user.username) }}
            >
              {getInitials(user.username, 2)}
            </div>
          ) : (
            <div className="profile-avatar" title="Gäst">
              👤
            </div>
          )}
          <h1>Chappy</h1>
        </div>
        {user && (
          <div className="user-info">
            <span>{user.isGuest ? 'Gäst' : `Inloggad som: ${user.username}`}</span>
            <button onClick={handleLogout} className="logout-btn">
              {user.isGuest ? 'Avsluta' : 'Logga ut'}
            </button>
          </div>
        )}
      </div>
      
      <div className="conversations-list">
        {conversations.map((conversation) => (
          <ConversationItem
            key={`${conversation.type}-${conversation.id}`}
            conversation={conversation}
            onClick={() => handleConversationClick(conversation)}
            onDeleteChannel={handleDeleteChannelClick}
            currentUserId={user?.userId}
          />
        ))}
      </div>

      {/* Create Channel Button - only for authenticated users */}
      {user && !user.isGuest && (
        <button 
          className="create-channel-btn"
          onClick={() => setShowCreateChannel(true)}
          title="Skapa ny kanal"
        >
          +
        </button>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Skapa ny kanal</h2>
            <form onSubmit={handleCreateChannel}>
              <div className="form-group">
                <label htmlFor="channelName">Kanalnamn *</label>
                <input
                  type="text"
                  id="channelName"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  required
                  placeholder="Ange kanalnamn"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="channelDescription">Beskrivning</label>
                <input
                  type="text"
                  id="channelDescription"
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="Beskrivning av kanalen"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newChannelLocked}
                    onChange={(e) => setNewChannelLocked(e.target.checked)}
                  />
                  Låst kanal (endast inloggade användare)
                </label>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateChannel(false)}>
                  Avbryt
                </button>
                <button type="submit">
                  Skapa kanal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal - only for authenticated users */}
      {showProfileModal && user && !user.isGuest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Profilinställningar</h2>
            <div className="profile-info">
              <div 
                className="profile-avatar-large"
                style={{ backgroundColor: user ? getColorFromName(user.username) : '#808080' }}
              >
                {user ? getInitials(user.username, 2) : '👤'}
              </div>
              <div className="profile-details">
                <h3>{user?.username}</h3>
                <p>Användare</p>
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                className="delete-account-btn"
                onClick={handleDeleteAccount}
              >
                🗑️ Ta bort konto
              </button>
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={() => setShowProfileModal(false)}>
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Channel Modal */}
      {showDeleteChannel && channelToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ta bort kanal</h2>
            <div className="delete-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-text">
                <p><strong>Är du säker på att du vill ta bort kanalen "{channelToDelete.name}"?</strong></p>
                <p>Detta kan inte ångras och alla meddelanden i kanalen kommer att försvinna.</p>
              </div>
            </div>
            
            {deleteError && (
              <div className="error-message">
                <div className="error-icon">❌</div>
                <div className="error-text">{deleteError}</div>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteChannel(false)
                  setChannelToDelete(null)
                }}
                className="cancel-btn"
              >
                Avbryt
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDeleteChannel}
                className="delete-btn"
              >
                🗑️ Ta bort kanal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatOverviewPage
