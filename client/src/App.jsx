import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './layout/header'

function App() {

  return (
    <Router>
      <div className="App" >
        <div className='mb-16'>
          <Header />
        </div>
        <Routes>
        </Routes>
      </div>
    </Router>
  )
}

export default App
