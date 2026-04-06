import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Temporary placeholder pages
const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="card text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
        <span className="text-white text-2xl font-bold">SC</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Smart Campus</h1>
      <p className="text-gray-500 mt-1 mb-6">Operations Hub</p>
      <p className="text-sm text-gray-400">Login page coming soon...</p>
    </div>
  </div>
)

const Dashboard = () => (
  <div className="card text-center py-16">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
    <p className="text-gray-400 text-sm">You are logged in!</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}