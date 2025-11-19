import { useEffect, useState } from 'react'

export default function GlobalStats({ baseUrl }) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/cmc/global?convert=USD`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        setStats(json.data)
      } catch (e) {
        setError(e.message)
      }
    }
    fetchStats()
  }, [baseUrl])

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
        Failed to load global stats: {error}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300 animate-pulse">
        Loading global market stats...
      </div>
    )
  }

  const quote = stats.quote?.USD || {}

  const items = [
    { label: 'Total Market Cap', value: quote.total_market_cap, prefix: '$' },
    { label: '24h Volume', value: quote.total_volume_24h, prefix: '$' },
    { label: 'BTC Dominance', value: stats.btc_dominance, suffix: '%' },
    { label: 'Active Cryptos', value: stats.active_cryptocurrencies },
  ]

  const format = (n) => {
    if (n == null) return '—'
    if (typeof n === 'number') {
      if (n > 1e12) return (n / 1e12).toFixed(2) + 'T'
      if (n > 1e9) return (n / 1e9).toFixed(2) + 'B'
      if (n > 1e6) return (n / 1e6).toFixed(2) + 'M'
      if (n > 1e3) return (n / 1e3).toFixed(2) + 'K'
      return n.toLocaleString()
    }
    return n
  }

  return (
    <section className="relative -mt-16 z-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.label} className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300/80">{it.label}</p>
              <p className="mt-2 text-xl md:text-2xl font-semibold">
                {it.prefix || ''}{format(it.value)}{it.suffix || ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
