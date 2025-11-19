import { useMemo } from 'react'
import Hero from './components/Hero'
import GlobalStats from './components/GlobalStats'
import TopMovers from './components/TopMovers'
import MarketTable from './components/MarketTable'

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero with Spline cover */}
      <Hero />

      {/* Floating global stats cards */}
      <GlobalStats baseUrl={baseUrl} />

      {/* Top movers grid */}
      <TopMovers baseUrl={baseUrl} />

      {/* Market table */}
      <MarketTable baseUrl={baseUrl} />

      <footer className="border-t border-white/10 py-10 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400">
          <p>Crypto Monitor • Futuristic UI</p>
          <p className="text-xs">Data via CoinMarketCap • This is a demo dashboard</p>
        </div>
      </footer>
    </div>
  )
}

export default App
