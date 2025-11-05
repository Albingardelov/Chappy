import './Button.css'

function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  disabled = false, 
  type = 'button',
  onClick 
}) {
  const className = `btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''} ${disabled ? 'btn-disabled' : ''}`
  
  return (
    <button 
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button

