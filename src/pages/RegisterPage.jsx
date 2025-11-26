import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../features/auth/useAuthStore'
import Button from '../components/Button'
import Input from '../components/Input'
import './RegisterPage.css'

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register(formData.username, formData.email, formData.password)
      navigate('/chat')
    } catch (err) {
      setError('Registrering misslyckades')
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
        <h1 className="auth-title">Registrera användare</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
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
            {loading ? 'Registrerar...' : 'Registrera'}
          </Button>
        </form>
        
        <p className="auth-link">
          Har du redan ett konto? <Link to="/login">Logga in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage

