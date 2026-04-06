import { createContext, useState, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { googleLogin, loginWithPassword as loginWithPasswordApi, getMe } from '../api/authApi'
import toast from 'react-hot-toast'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

function getStoredSession() {
  const token = localStorage.getItem('token')
  const stored = localStorage.getItem('user')
  if (!token || !stored) return null
  try {
    const decoded = jwtDecode(token)
    if (decoded.exp * 1000 > Date.now()) {
      return JSON.parse(stored)
    }
  } catch {
    // invalid token
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredSession())

  const clearSession = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const loginWithGoogle = useCallback(async (googleCredential) => {
    try {
      const { data } = await googleLogin(googleCredential)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success(`Welcome, ${data.user.name}!`)
      return data.user
    } catch (err) {
      toast.error('Google login failed. Please try again.')
      throw err
    }
  }, [])

  const loginWithPassword = useCallback(async (email, password) => {
    try {
      const { data } = await loginWithPasswordApi(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success(`Welcome, ${data.user.name}!`)
      return data.user
    } catch (err) {
      toast.error('Invalid email or password.')
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    toast.success('Logged out successfully.')
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMe()
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
    } catch {
      // token invalid — interceptor handles redirect
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loginWithGoogle,
      loginWithPassword,
      logout,
      refreshUser,
      isAdmin:      user?.role === 'ADMIN',
      isTechnician: user?.role === 'TECHNICIAN',
      isUser:       user?.role === 'USER',
    }}>
      {children}
    </AuthContext.Provider>
  )
}