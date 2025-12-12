import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import ScanPage from './pages/ScanPage';
import Pools from './pages/Pools';
import Workers from './pages/Workers';
import Alerts from './pages/Alerts';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import './App.css';

const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Загружаем состояние из localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });

  console.log('Нормально делай, нормально будет ===>>>');

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <Header isSidebarCollapsed={isSidebarCollapsed} />
      <div
        className='flex min-h-screen transition-all duration-300'
        style={{
          marginLeft: isSidebarCollapsed ? '80px' : '256px',
          marginTop: '73px', // Высота Header
        }}
      >
        <div className='flex-1 flex flex-col w-full'>
          <main className='flex-1 bg-base-100 overflow-auto text-primary'>
            <Routes>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/devices' element={<Devices />} />
              <Route path='/scan' element={<ScanPage />} />
              <Route path='/pools' element={<Pools />} />
              <Route path='/workers' element={<Workers />} />
              <Route path='/alerts' element={<Alerts />} />
              <Route path='/maintenance' element={<Maintenance />} />
              <Route path='/settings' element={<Settings />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/' element={<Navigate to='/dashboard' replace />} />
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
        <div className='App'>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route
              path='/*'
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
