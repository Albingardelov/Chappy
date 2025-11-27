import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../features/auth/useAuthStore'
import useConversationsStore from '../features/conversations/useConversationsStore'
import useUsersStore from '../features/users/useUsersStore'
import { createChannel, deleteChannel, deleteUser } from '../services/api'
import ConversationItem from '../components/ConversationItem'
import { getInitials, getColorFromName } from '../utils/initials'
import userIcon from '../../assets/square-user.svg'
import './ChatOverviewPage.css'

function ChatOverviewPage() {
  const conversations = useConversationsStore((state) => state.conversations)
  const loading = useConversationsStore((state) => state.loading)
  const loadConversations = useConversationsStore((state) => state.loadConversations)
  const removeConversation = useConversationsStore((state) => state.removeConversation)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDeleteChannel, setShowDeleteChannel] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelLocked, setNewChannelLocked] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const availableUsers = useUsersStore((state) => state.users)
  const loadingUsers = useUsersStore((state) => state.loading)
  const loadUsers = useUsersStore((state) => state.loadUsers)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeleteAccountClick = () => {
    setDeleteAccountError('')
    setShowDeleteAccount(true)
  }

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteUser()
      logout()
      navigate('/')
    } catch (error) {
      console.error('Kunde inte ta bort konto:', error)
      setDeleteAccountError('Kunde inte ta bort kontot. Försök igen.')
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
      removeConversation(channelToDelete.id, 'channel')
      setShowDeleteChannel(false)
      setChannelToDelete(null)
      setDeleteError('')
    } catch (error) {
      console.error('Kunde inte ta bort kanal:', error)
      setDeleteError('Kunde inte ta bort kanalen. Kontrollera att du är skaparen av kanalen.')
    }
  }

  const handleConversationClick = (conversation) => {
    navigate(`/chat/${conversation.type}/${conversation.id}`)
  }

  const handleSearchUsers = async () => {
    setShowUserSearch(true)
    await loadUsers()
  }

  const handleStartDM = (username) => {
    // Gäster kan inte starta DM
    if (user?.isGuest) {
      return
    }
    
    setShowUserSearch(false)
    setSearchQuery('')
    navigate(`/chat/dm/${username}`)
  }

  const filteredUsers = availableUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        {conversations
          .filter(conversation => {
            // Dölj DM-konversationer för gäster
            if (conversation.type === 'dm' && user?.isGuest) {
              return false
            }
            return true
          })
          .map((conversation) => (
            <ConversationItem
              key={`${conversation.type}-${conversation.id}`}
              conversation={conversation}
              onClick={() => handleConversationClick(conversation)}
              onDeleteChannel={handleDeleteChannelClick}
              currentUserId={user?.userId}
            />
          ))}
      </div>

      {/* Action Buttons */}
      {user && (
        <div className="action-buttons">
          <button 
            className="search-users-btn"
            onClick={handleSearchUsers}
            title="Sök användare"
          >
            <img src={userIcon} alt="Sök användare" />
          </button>
          {!user.isGuest && (
            <button 
              className="create-channel-btn"
              onClick={() => setShowCreateChannel(true)}
              title="Skapa ny kanal"
            >
              +
            </button>
          )}
        </div>
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
                onClick={handleDeleteAccountClick}
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

      {/* User Search Modal */}
      {showUserSearch && user && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Sök användare</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Sök efter användarnamn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            {loadingUsers ? (
              <div className="loading">Laddar användare...</div>
            ) : (
              <div className="users-list">
                {filteredUsers.length === 0 ? (
                  <div className="no-results">
                    {searchQuery ? 'Inga användare hittades' : 'Inga användare tillgängliga'}
                  </div>
                ) : (
                  filteredUsers.map((userItem) => (
                    <div
                      key={userItem.username}
                      className={`user-item ${user?.isGuest ? 'user-item-disabled' : ''}`}
                      onClick={() => handleStartDM(userItem.username)}
                      title={user?.isGuest ? 'Logga in för att skicka DM' : `Skicka DM till ${userItem.username}`}
                    >
                      <div 
                        className="user-avatar"
                        style={{ backgroundColor: getColorFromName(userItem.username) }}
                      >
                        {getInitials(userItem.username, 2)}
                      </div>
                      <span className="user-name">{userItem.username}</span>
                      {user?.isGuest && (
                        <span className="guest-hint">🔒 Logga in för att skicka DM</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            
            <div className="modal-actions">
              <button type="button" onClick={() => {
                setShowUserSearch(false)
                setSearchQuery('')
              }}>
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ta bort konto</h2>
            <div className="delete-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-text">
                <p><strong>Är du säker på att du vill ta bort ditt konto?</strong></p>
                <p>Detta kan inte ångras och all din data kommer att försvinna permanent.</p>
              </div>
            </div>
            
            {deleteAccountError && (
              <div className="error-message">
                <div className="error-icon">❌</div>
                <div className="error-text">{deleteAccountError}</div>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteAccount(false)
                  setDeleteAccountError('')
                }}
                className="cancel-btn"
              >
                Avbryt
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDeleteAccount}
                className="delete-btn"
              >
                🗑️ Ta bort konto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatOverviewPage
