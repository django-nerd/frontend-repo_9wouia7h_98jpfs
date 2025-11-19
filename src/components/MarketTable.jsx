import { useEffect, useMemo, useState } from 'react'

export default function MarketTable({ baseUrl }) {
  const [coins, setCoins] = useState([])
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('market_cap')
  const [dir, setDir] = useState('desc')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/cmc/listings?limit=200&convert=USD`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        setCoins(json.data || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [baseUrl])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = coins
    if (q) {
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    }
    const get = (c) => {
      const q = c.quote?.USD || {}
      switch (sortKey) {
        case 'price': return q.price || 0
        case 'change': return q.percent_change_24h || 0
        case 'volume': return q.volume_24h || 0
        default: return q.market_cap || 0
      }
    }
    list = [...list].sort((a,b) => (get(a) - get(b)) * (dir === 'asc' ? 1 : -1))
    return list
  }, [coins, query, sortKey, dir])

  const th = (key, label) => (
    <th className="px-3 py-2 text-left text-slate-300/80 font-medium cursor-pointer select-none" onClick={() => {
      if (sortKey === key) setDir(dir === 'asc' ? 'desc' : 'asc')
      else { setSortKey(key); setDir('desc') }
    }}>
      {label} {sortKey === key ? (dir === 'asc' ? '▲' : '▼') : ''}
    </th>
  )

  return (
    <section id="dashboard" className="mx-auto max-w-6xl px-6 mt-12 mb-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-white text-2xl md:text-3xl font-bold">Market Overview</h2>
        <input
          className="w-full md:w-64 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
          placeholder="Search by name or symbol..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 mb-4">
          Failed to load market: {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left text-slate-300/80 font-medium">#</th>
              <th className="px-3 py-2 text-left text-slate-300/80 font-medium">Name</th>
              {th('price', 'Price')}
              {th('change', '24h %')}
              {th('market_cap', 'Market Cap')}
              {th('volume', '24h Volume')}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-3 py-6 text-center text-slate-300/70">Loading...</td>
              </tr>
            ) : (
              filtered.map((c, i) => {
                const q = c.quote?.USD || {}
                const up = (q.percent_change_24h || 0) >= 0
                return (
                  <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2 text-slate-300/80">{i + 1}</td>
                    <td className="px-3 py-2 text-white font-medium flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
                      {c.name}
                      <span className="text-slate-300/70 text-xs">{c.symbol}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-100">${q.price?.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                    <td className={`px-3 py-2 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{up ? '▲' : '▼'} {(q.percent_change_24h || 0).toFixed(2)}%</td>
                    <td className="px-3 py-2 text-slate-100">${(q.market_cap || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-slate-100">${(q.volume_24h || 0).toLocaleString()}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
