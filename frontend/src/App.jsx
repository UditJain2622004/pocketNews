import { useState, useEffect } from 'react'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'

const API_BASE = 'http://localhost:8000'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(null)

  // Fetch user profile on token change/mount
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Token verification failed')
        }
        return res.json()
      })
      .then(data => {
        setUser(data)
      })
      .catch(err => {
        console.error(err)
        // Clear invalid token
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
    }
  }, [token])

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setShowLogin(false)
    setShowSignUp(false)
    setShowLanding(false) // Automatically direct to app dashboard
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setShowLanding(true)
  }

  // Routing
  if (showLogin) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onCancel={() => setShowLogin(false)} 
        onSwitchToSignUp={() => {
          setShowLogin(false);
          setShowSignUp(true);
        }}
      />
    )
  }

  if (showSignUp) {
    return (
      <SignUpPage 
        onSignupSuccess={handleLoginSuccess} 
        onCancel={() => setShowSignUp(false)} 
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowLogin(true);
        }}
      />
    )
  }

  if (showLanding) {
    return (
      <Home 
        onEnterApp={() => setShowLanding(false)}
        user={user}
        onLoginClick={() => {
          setShowLogin(true);
          setShowSignUp(false);
        }}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <DashboardPage 
      setShowLanding={setShowLanding}
      user={user}
      onLogout={handleLogout}
    />
  )
}

export default App
