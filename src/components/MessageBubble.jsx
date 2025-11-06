import './MessageBubble.css'

function MessageBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={`message-bubble ${isOwn ? 'message-own' : 'message-other'}`}>
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

