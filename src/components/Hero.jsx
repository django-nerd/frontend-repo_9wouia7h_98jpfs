import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/44zrIZf-iQZhbQNQ/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Holographic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black pointer-events-none" />

      <div className="relative h-full flex items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Real‑Time Crypto Monitor
          </h1>
          <p className="mt-5 text-base md:text-lg text-slate-200/80">
            Track prices, market caps and trends with a sleek, futuristic dashboard. Powered by CoinMarketCap.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#dashboard" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition">
              Explore Dashboard
            </a>
            <a href="#top" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-semibold shadow-[0_10px_40px_rgba(168,85,247,0.35)]">
              Top Movers
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
