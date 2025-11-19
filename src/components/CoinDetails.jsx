import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function CoinDetails() {
  const { symbol } = useParams()
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingCache, setUsingCache] = useState(false)

  const cacheKey = `cache:quote:${symbol}:USD`

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      setUsingCache(false)
      try {
        const res = await fetch(`${baseUrl}/api/cmc/quotes?symbols=${encodeURIComponent(symbol)}&convert=USD`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        const raw = json?.data?.[symbol]
        const coin = Array.isArray(raw) ? raw[0] : raw
        setData(coin || null)
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data: coin }))
        } catch {}
      } catch (e) {
        setError(e.message)
        try {
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            const parsed = JSON.parse(cached)
            setData(parsed.data || null)
            setUsingCache(true)
          }
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    if (symbol) load()
  }, [symbol, baseUrl])

  const q = data?.quote?.USD || {}
  const up = (q.percent_change_24h || 0) >= 0

  const Notice = () => (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 p-3 text-sm mb-3">
      Live data unavailable or limited. Showing last cached snapshot.
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-black/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors">
            ← Back
          </Link>
          <div className="text-slate-400 text-sm">Live quotes via CoinMarketCap</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center text-slate-300/80 py-10">Loading {symbol}…</div>
        )}
        {error && !data && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 mb-6">Failed to load: {error}</div>
        )}
        {usingCache && <Notice />}
        {(!loading && !data && !error) && (
          <div className="text-center text-slate-300/80 py-10">No data found for {symbol}</div>
        )}

        {data && (
          <div className="space-y-8">
            <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-block w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
                  <h1 className="text-2xl md:text-3xl font-bold">{data.name} <span className="text-slate-400 text-xl">{data.symbol}</span></h1>
                </div>
                <div className="mt-4 text-4xl font-semibold tracking-tight">${(q.price || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
                <div className={`mt-1 inline-flex items-center gap-1 text-sm ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{up ? '▲' : '▼'} {(q.percent_change_24h || 0).toFixed(2)}% (24h)</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto">
                <Stat label="Market Cap" value={`$${(q.market_cap || 0).toLocaleString()}`} />
                <Stat label="24h Volume" value={`$${(q.volume_24h || 0).toLocaleString()}`} />
                <Stat label="Dominance" value={`${(q.market_cap_dominance || 0).toFixed(2)}%`} />
                <Stat label="Rank" value={`#${data.cmc_rank || '-'}`} />
                <Stat label="Circulating" value={`${(data.circulating_supply || 0).toLocaleString()} ${data.symbol}`} />
                <Stat label="Total Supply" value={`${(data.total_supply || 0).toLocaleString()} ${data.symbol}`} />
              </div>
            </section>

            <Sparkline symbol={symbol} baseUrl={baseUrl} />

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-slate-300/80 text-sm leading-6">
                Real-time quote information for {data.name} fetched through the backend proxy. The mini chart below shows recent price movement.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold mb-3">Price Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Perf label="1h" value={q.percent_change_1h} />
                <Perf label="24h" value={q.percent_change_24h} />
                <Perf label="7d" value={q.percent_change_7d} />
                <Perf label="30d" value={q.percent_change_30d} />
                <Perf label="60d" value={q.percent_change_60d} />
                <Perf label="90d" value={q.percent_change_90d} />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="text-white text-base font-semibold mt-1">{value}</div>
    </div>
  )
}

function Perf({ label, value }) {
  const up = (value || 0) >= 0
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className={`text-sm font-semibold mt-1 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{value == null ? '—' : `${value.toFixed(2)}%`}</div>
    </div>
  )
}

// Sparkline now uses real historical data from the backend history endpoint
function Sparkline({ symbol, baseUrl }) {
  const [points, setPoints] = useState([])
  const [error, setError] = useState(null)
  const [usingCache, setUsingCache] = useState(false)

  const cacheKey = `cache:spark:${symbol}:USD`

  useEffect(() => {
    const fetchHistory = async () => {
      setUsingCache(false)
      setError(null)
      try {
        const res = await fetch(`${baseUrl}/api/history?symbol=${encodeURIComponent(symbol)}&convert=USD&days=7`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        const prices = Array.isArray(json?.points) ? json.points.map(p => p[1]) : []
        if (!prices.length) throw new Error('No history')
        setPoints(prices)
        try { localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data: prices })) } catch {}
      } catch (e) {
        setError(e.message)
        try {
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed.data) && parsed.data.length) {
              setPoints(parsed.data)
              setUsingCache(true)
            }
          }
        } catch {}
      }
    }
    fetchHistory()
  }, [symbol, baseUrl])

  if (error && !points.length) {
    return (
      <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
        <h2 className="text-lg font-semibold mb-2 text-red-200">Mini Chart</h2>
        <p className="text-red-200 text-sm">Failed to load chart: {error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Mini Chart</h2>
        {usingCache && (
          <span className="text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 text-xs">Cached</span>
        )}
      </div>
      {points.length ? (
        <SVGLine data={points} />
      ) : (
        <div className="text-slate-300/80 text-sm">Loading chart…</div>
      )}
    </section>
  )
}

function SVGLine({ data }) {
  const w = 600
  const h = 140
  const pad = 10
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  const lastUp = data[data.length - 1] >= data[0]
  const stroke = lastUp ? '#34d399' : '#fb7185'

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={pts} />
      <defs>
        <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill="url(#fillGrad)"
        points={`${pts} ${w - pad},${h - pad} ${pad},${h - pad}`}
      />
    </svg>
  )
}
