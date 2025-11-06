import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import './LoginPage.css'

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, enterAsGuest } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.username, formData.password)
      navigate('/chat')
    } catch (err) {
      setError('Inloggning misslyckades')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="auth-page">
      <div className="auth-content">
        <h1 className="auth-title">Logga in</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            name="username"
            placeholder="Användarnamn"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <Input
            name="password"
            type="password"
            placeholder="Lösenord"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Loggar in...' : 'Logga in'}
          </Button>
        </form>
        
        <p className="auth-link">
          Har du inget konto? <Link to="/register">Registrera dig</Link>
        </p>
        
        <div className="auth-divider">
          <span>eller</span>
        </div>
        
        <Button 
          variant="outline" 
          fullWidth 
          onClick={() => {
            enterAsGuest()
            navigate('/chat')
          }}
        >
          Chatta som gäst
        </Button>
      </div>
    </div>
  )
}

export default LoginPage

