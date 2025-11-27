import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 bg-base-100 overflow-auto">
              <Routes>
                <Route path="/dashboard" element={<div className="p-8"><h1>Dashboard</h1></div>} />
                <Route path="/devices" element={<div className="p-8"><h1>Devices</h1></div>} />
                <Route path="/pools" element={<div className="p-8"><h1>Pools</h1></div>} />
                <Route path="/workers" element={<div className="p-8"><h1>Workers</h1></div>} />
                <Route path="/settings" element={<div className="p-8"><h1>Settings</h1></div>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<div className="p-8"><h1>Dashboard</h1></div>} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
