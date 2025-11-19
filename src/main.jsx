import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Test from './Test'
import CoinDetails from './components/CoinDetails'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/coin/:symbol" element={<CoinDetails />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
