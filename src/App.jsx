import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatOverviewPage from './pages/ChatOverviewPage'
import ChatViewPage from './pages/ChatViewPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/chat" element={<ChatOverviewPage />} />
            <Route path="/chat/:type/:id" element={<ChatViewPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
