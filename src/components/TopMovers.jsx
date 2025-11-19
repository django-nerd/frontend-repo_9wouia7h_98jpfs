import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export default function TopMovers({ baseUrl }) {
  const [coins, setCoins] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingCache, setUsingCache] = useState(false)

  const cacheKey = 'cache:listings:USD:200'

  useEffect(() => {
    const load = async () => {
      setUsingCache(false)
      try {
        const res = await fetch(`${baseUrl}/api/cmc/listings?limit=200&convert=USD`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        setCoins(json.data || [])
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data: json.data }))
        } catch {}
      } catch (e) {
        setError(e.message)
        try {
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            const parsed = JSON.parse(cached)
            setCoins(parsed.data || [])
            setUsingCache(true)
          }
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [baseUrl])

  const movers = useMemo(() => {
    const withChange = coins.map(c => ({
      ...c,
      change: c.quote?.USD?.percent_change_24h ?? 0
    }))
    return withChange
      .filter(c => typeof c.change === 'number')
      .sort((a,b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 12)
  }, [coins])

  const format = (n) => {
    if (n == null) return '—'
    if (Math.abs(n) >= 1) return n.toFixed(2)
    return n.toFixed(4)
  }

  const Notice = () => (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 p-3 text-sm mb-3">
      Live data unavailable or limited. Showing last cached snapshot.
    </div>
  )

  return (
    <section id="top" className="mx-auto max-w-6xl px-6 mt-12">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Top Movers (24h)</h2>
        {loading && <span className="text-slate-300/70 text-sm animate-pulse">Refreshing...</span>}
      </div>

      {error && !coins.length && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 mb-4">
          Failed to load coins: {error}
        </div>
      )}

      {usingCache && <Notice />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {movers.map((c) => {
          const up = (c.change || 0) >= 0
          return (
            <Link to={`/coin/${c.symbol}`} key={c.id} className="group relative rounded-2xl bg-white/5 hover:bg-white/10 transition border border-white/10 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/40 to-fuchsia-500/40 border border-white/20" />
                  <div>
                    <p className="text-white font-semibold">{c.name} <span className="text-slate-300/70">({c.symbol})</span></p>
                    <p className="text-slate-300/80 text-sm">${c.quote?.USD?.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className={`text-sm font-medium ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{up ? '▲' : '▼'} {format(c.change)}%</p>
                  <p className="text-slate-300/70 text-xs">Market Cap: ${ (c.quote?.USD?.market_cap || 0).toLocaleString() }</p>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(600px_200px_at_var(--x,50%)_0%,rgba(168,85,247,0.15),transparent)]" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
