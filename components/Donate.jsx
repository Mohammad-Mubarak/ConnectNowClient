'use client'
import { useState } from 'react'
import {
  Heart, Coffee, Code, Zap, Star, Github,
  Globe, Clock, X, ExternalLink, Sparkles
} from 'lucide-react'

const AMOUNTS = [
  { val: 3,  label: '$3',  emoji: '☕', desc: 'A coffee'       },
  { val: 5,  label: '$5',  emoji: '🍕', desc: 'A slice'        },
  { val: 10, label: '$10', emoji: '🚀', desc: 'Rocket fuel'    },
  { val: 20, label: '$20', emoji: '💎', desc: 'Pure love'      },
]

const STATS = [
  { icon: '🌙', label: 'Late nights',   val: '400+'  },
  { icon: '☕', label: 'Coffees drunk', val: '800+'  },
  { icon: '🐛', label: 'Bugs squashed', val: '1,200+'},
  { icon: '❤️', label: 'Built with',    val: 'Love'  },
]

export default function DonateSection() {
  const [selected, setSelected] = useState(5)
  const [custom, setCustom]     = useState('')
  const [liked, setLiked]       = useState(false)
  const [showThanks, setShowThanks] = useState(false)

  const finalAmount = custom ? parseFloat(custom) || 0 : selected

  const handleDonate = () => {
    // Replace YOUR_PAYPAL_ID with actual PayPal.me link
    const url = `https://www.paypal.com/paypalme/YOUR_PAYPAL_ID/${finalAmount}`
    window.open(url, '_blank')
    setShowThanks(true)
  }

  return (
    <div className="relative min-h-screen bg-[#060A14] flex items-center justify-center px-4 py-16 overflow-hidden">

      {/* Ambient glows */}
      <div className="fixed w-[600px] h-[600px] rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full bottom-0 left-1/4 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[300px] h-[300px] rounded-full bottom-0 right-1/4 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(20,184,166,0.06) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      <div className="relative z-10 w-full max-w-md">

        {/* ── THANK YOU OVERLAY ── */}
        {showThanks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(20px)' }}>
            <div className="relative w-full max-w-sm text-center p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(244,114,182,0.2)' }}>
              <button onClick={() => setShowThanks(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-500 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <X size={14} />
              </button>
              <div className="text-6xl mb-4 animate-bounce">🥹</div>
              <h2 className="text-white text-2xl font-black mb-2">You're amazing.</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Seriously. You have no idea what this means to someone building alone at 2am. Thank you from the bottom of my heart. 💖
              </p>
              <div className="h-px w-full mb-5"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(244,114,182,0.4),transparent)' }} />
              <p className="text-gray-600 text-xs">Every dollar keeps the servers alive & me caffeinated ☕</p>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="text-center mb-8">
          {/* Heartbeat icon */}
          <div className="relative inline-flex mb-5">
            <div className="absolute inset-0 rounded-3xl animate-pulse"
              style={{ background: 'linear-gradient(135deg,#f472b6,#8b5cf6)', filter: 'blur(16px)', opacity: 0.5, margin: '-6px' }} />
            <div className="relative w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(244,114,182,0.15),rgba(139,92,246,0.15))', border: '1px solid rgba(244,114,182,0.25)' }}>
              <Heart size={28} className="text-pink-400 fill-pink-400" />
            </div>
          </div>

          <h1 className="text-white text-3xl font-black tracking-tight mb-2">
            Keep the lights on 💡
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            Hey, I'm Manik — a solo dev who built this entirely alone, nights & weekends, fueled by coffee and stubbornness.
          </p>
        </div>

        {/* ── STORY CARD ── */}
        <div className="rounded-3xl p-5 mb-4 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Shimmer top */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(244,114,182,0.6),rgba(139,92,246,0.6),transparent)' }} />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-lg font-black text-white flex-shrink-0">
              M
            </div>
            <div>
              <p className="text-white text-sm font-bold">Manik</p>
              <p className="text-gray-600 text-[10px]">Solo Developer · Hyderabad, India 🇮🇳</p>
            </div>
            <button
              onClick={() => setLiked(l => !l)}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all hover:scale-110 active:scale-95"
              style={{
                background: liked ? 'rgba(244,114,182,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${liked ? 'rgba(244,114,182,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: liked ? '#f472b6' : '#6b7280',
              }}>
              <Heart size={11} className={liked ? 'fill-pink-400' : ''} />
              {liked ? 'Loved' : 'Love'}
            </button>
          </div>

          <p className="text-gray-400 text-[13px] leading-relaxed mb-4">
            "No team. No investors. No salary. Just me, a laptop, and a dream of building something people love.
            Every feature you use was coded after my day job ended — sometimes at <span className="text-pink-400 font-semibold">2am</span>, 
            sometimes at <span className="text-violet-400 font-semibold">5am</span>.
            Server bills don't care about passion, though. 😅"
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {STATS.map(({ icon, label, val }) => (
              <div key={label} className="flex flex-col items-center py-2.5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-base mb-0.5">{icon}</span>
                <p className="text-white text-xs font-black leading-none">{val}</p>
                <p className="text-gray-600 text-[8px] mt-0.5 text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT IT COVERS ── */}
        <div className="rounded-2xl px-4 py-3 mb-4 flex flex-wrap gap-x-4 gap-y-2"
          style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.12)' }}>
          <p className="text-teal-400 text-[10px] font-bold uppercase tracking-widest w-full mb-1">Your donation covers</p>
          {['🖥️ Server costs', '📡 WebRTC infra', '🔒 SSL & domains', '☕ Dev fuel'].map(item => (
            <span key={item} className="text-gray-400 text-[11px] font-medium">{item}</span>
          ))}
        </div>

        {/* ── AMOUNT PICKER ── */}
        <div className="rounded-3xl p-4 mb-3"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-3">Pick an amount</p>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {AMOUNTS.map(({ val, label, emoji, desc }) => (
              <button key={val}
                onClick={() => { setSelected(val); setCustom('') }}
                className="flex flex-col items-center py-3 rounded-2xl transition-all hover:scale-[1.04] active:scale-95"
                style={{
                  background: selected === val && !custom
                    ? 'linear-gradient(135deg,rgba(244,114,182,0.18),rgba(139,92,246,0.18))'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected === val && !custom ? 'rgba(244,114,182,0.35)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <span className="text-lg mb-0.5">{emoji}</span>
                <p className="text-white text-sm font-black">{label}</p>
                <p className="text-gray-600 text-[9px] mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${custom ? 'rgba(244,114,182,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
              <span className="text-gray-500 text-sm font-bold">$</span>
              <input
                type="number"
                value={custom}
                onChange={e => { setCustom(e.target.value); setSelected(null) }}
                placeholder="Custom amount"
                min="1"
                className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder-gray-700"
              />
            </div>
          </div>
        </div>

        {/* ── DONATE BUTTON ── */}
        <button
          onClick={handleDonate}
          disabled={!finalAmount || finalAmount <= 0}
          className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed mb-3"
          style={{
            background: 'linear-gradient(135deg,#f472b6,#8b5cf6,#14b8a6)',
            boxShadow: '0 0 30px rgba(244,114,182,0.25), 0 0 60px rgba(139,92,246,0.1)',
          }}>
          <Heart size={16} className="fill-white" />
          Support with ${finalAmount || '—'} via PayPal
          <ExternalLink size={13} className="opacity-70" />
        </button>

        {/* ── FOOTNOTE ── */}
        <div className="text-center space-y-2">
          <p className="text-gray-700 text-[10px]">🔒 Secure · Powered by PayPal · No account needed</p>
          <p className="text-gray-700 text-[10px]">
            Can't donate? A ⭐ on{' '}
            <a href="https://github.com" target="_blank" rel="noreferrer"
              className="text-gray-500 hover:text-white transition-colors underline underline-offset-2">
              GitHub
            </a>
            {' '}means just as much 💙
          </p>
        </div>

      </div>
    </div>
  )
}
