import { useState, useEffect } from 'react'
import { RoleSelection } from './components/RoleSelection/RoleSelection'
import DashboardPage from './pages/DashboardPage'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  specialization?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if there's a saved token and validate it
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      // Validate the token by calling /api/auth/me
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('Invalid token')
        })
        .then((data) => {
          setUser(data.user)
          setLoading(false)
        })
        .catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Show a brief loading state while checking for existing session
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F3F4F6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
        color: '#6B7280',
        fontSize: '15px',
      }}>
        Loading…
      </div>
    )
  }

  // If user is logged in → Dashboard, otherwise → Role Selection / Login
  if (user) {
    return <DashboardPage user={user} onLogout={handleLogout} />
  }

  return <RoleSelection onLogin={handleLogin} />
}

export default App
