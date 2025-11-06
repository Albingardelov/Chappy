import { Link } from 'react-router-dom'
import Button from '../components/Button'
import './HomePage.css'

function HomePage() {
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
        </div>
      </div>
    </div>
  )
}

export default HomePage

