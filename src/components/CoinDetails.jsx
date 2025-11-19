import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function CoinDetails() {
  const { symbol } = useParams()
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${baseUrl}/api/cmc/quotes?symbols=${encodeURIComponent(symbol)}&convert=USD`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        const raw = json?.data?.[symbol]
        const coin = Array.isArray(raw) ? raw[0] : raw
        setData(coin || null)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (symbol) load()
  }, [symbol, baseUrl])

  const q = data?.quote?.USD || {}
  const up = (q.percent_change_24h || 0) >= 0

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
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 mb-6">Failed to load: {error}</div>
        )}
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

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-slate-300/80 text-sm leading-6">
                Real-time quote information for {data.name} fetched through the backend proxy. Add-ons like historical charts, order books, and news can be integrated here. Let me know if you’d like sparklines or a deeper profile section.
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
