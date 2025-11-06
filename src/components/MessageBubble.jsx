import './MessageBubble.css'

function MessageBubble({ message, isOwn, showSender, currentUsername }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const senderName = isOwn 
    ? (currentUsername || 'Du')
    : (message.senderUsername || 'Unknown')

  return (
    <div className={`message-bubble ${isOwn ? 'message-own' : 'message-other'}`}>
      {showSender && (
        <div className="message-sender">
          {senderName}
        </div>
      )}
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-time">
        {formatTime(message.timestamp)}
      </div>
    </div>
  )
}

export default MessageBubble

