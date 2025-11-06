import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import Button from '../components/Button'
import './HomePage.css'

function HomePage() {
  const { enterAsGuest } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title">Chappy</h1>
        <p className="home-subtitle">Din chat-app</p>
        
        <div className="home-buttons">
          <Link to="/register">
            <Button variant="outline" fullWidth>
              Registrera användare
            </Button>
          </Link>
          
          <Link to="/login">
            <Button variant="primary" fullWidth>
              Logga in
            </Button>
          </Link>
          
          <div className="home-divider">
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
    </div>
  )
}

export default HomePage

