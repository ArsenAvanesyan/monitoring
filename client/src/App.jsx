import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
// import Register from './pages/Register' // Регистрация отключена
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import Pools from './pages/Pools'
import Workers from './pages/Workers'
import Alerts from './pages/Alerts'
import Maintenance from './pages/Maintenance'
import Settings from './pages/Settings'
import './App.css'

const AppLayout = () => {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 bg-base-100 overflow-auto text-primary">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/pools" element={<Pools />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Регистрация отключена */}
            {/* <Route path="/register" element={<Register />} /> */}
            <Route
              path="/*"
              element={<AppLayout />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
