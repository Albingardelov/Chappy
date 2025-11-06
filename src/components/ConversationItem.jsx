import { useState } from 'react'
import { getInitials, getColorFromName } from '../utils/initials'
import lockIcon from '../../assets/lock-white.svg'
import './ConversationItem.css'

function ConversationItem({ conversation, onClick, onDeleteChannel, currentUserId }) {
  const [showMenu, setShowMenu] = useState(false)

  const getIcon = () => {
    if (conversation.type === 'channel') {
      // Visa initialer för kanaler
      return getInitials(conversation.name, 2)
    } else {
      // Visa initialer för DM (användarnamn)
      return getInitials(conversation.name, 2)
    }
  }

  const handleMenuClick = (e) => {
    e.stopPropagation() // Förhindra att onClick triggas
    setShowMenu(!showMenu)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    onDeleteChannel(conversation.id)
    setShowMenu(false)
  }

  const canDeleteChannel = () => {
    return conversation.type === 'channel' && conversation.createdBy === currentUserId
  }

  const avatarColor = getColorFromName(conversation.name)

  return (
    <div className="conversation-item" onClick={onClick}>
      <div 
        className="conversation-avatar"
        style={{ backgroundColor: avatarColor }}
      >
        {getIcon()}
      </div>
      <div className="conversation-content">
        <div className="conversation-name">
          {conversation.name}
          {conversation.isLocked && (
            <span className="locked-indicator">
              <img src={lockIcon} alt="Låst kanal" />
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <div className="conversation-preview">
            {conversation.lastMessage}
          </div>
        )}
      </div>
      <div className="conversation-actions">
        {conversation.timestamp && (
          <div className="conversation-time">
            {conversation.timestamp}
          </div>
        )}
        {canDeleteChannel() && (
          <div className="conversation-menu">
            <button 
              className="menu-button"
              onClick={handleMenuClick}
              title="Kanalinställningar"
            >
              ⋯
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button 
                  className="delete-button"
                  onClick={handleDeleteClick}
                >
                  🗑️ Ta bort kanal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationItem

