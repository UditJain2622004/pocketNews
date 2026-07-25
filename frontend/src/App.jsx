import { useState, useEffect } from 'react'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'

const API_BASE = 'http://localhost:8001'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(null)

  // Listen to popstate event (browser back/forward button clicks)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Navigation helper
  const navigateTo = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

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
        navigateTo('/')
      })
    }
  }, [token])

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    navigateTo('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigateTo('/')
  }

  // Routing rendering logic
  if (currentPath === '/login') {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onCancel={() => navigateTo('/')} 
        onSwitchToSignUp={() => navigateTo('/signup')}
      />
    )
  }

  if (currentPath === '/signup') {
    return (
      <SignUpPage 
        onSignupSuccess={handleLoginSuccess} 
        onCancel={() => navigateTo('/')} 
        onSwitchToSignIn={() => navigateTo('/login')}
      />
    )
  }

  if (currentPath === '/dashboard') {
    if (!token) {
      // Redirect to login if trying to access dashboard unauthenticated
      return (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onCancel={() => navigateTo('/')} 
          onSwitchToSignUp={() => navigateTo('/signup')}
        />
      )
    }
    return (
      <DashboardPage 
        setShowLanding={() => navigateTo('/')}
        user={user}
        onLogout={handleLogout}
        token={token}
        onProfileUpdate={setUser}
      />
    )
  }

  // Fallback / default path is Home (landing page)
  return (
    <Home 
      onEnterApp={() => navigateTo('/dashboard')}
      user={user}
      onLoginClick={() => navigateTo('/login')}
      onLogout={handleLogout}
    />
  )
}

export default App
