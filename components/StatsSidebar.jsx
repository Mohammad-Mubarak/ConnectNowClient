'use client'
import { Users, Globe, UserPlus, Flame } from 'lucide-react'
import { useState } from 'react'
import Flags from 'country-flag-icons/react/3x2'

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'BR', name: 'Brazil' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
]

export default function StatsSidebar() {
  const [duoMode, setDuoMode] = useState(false)
  const [activeCountry, setActiveCountry] = useState(null)

  return (
    <div className="glass rounded-2xl p-4 border border-white/6 flex flex-col gap-4">

      {/* Online Count */}
      <div className="glass-dark rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Users size={18} className="text-green-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-green-400">2.4M</p>
          <p className="text-xs text-gray-500">Users Online Now</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>

      {/* Countries */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Active Regions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map(({ code, name }) => {
            const Flag = Flags[code]
            const isActive = activeCountry === code
            return (
              <button
                key={code}
                onClick={() => setActiveCountry(isActive ? null : code)}
                title={name}
                className={`group relative w-9 h-6 rounded-md overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
                  isActive
                    ? 'border-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.5)]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {Flag ? (
                  <Flag className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">{code}</span>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg text-[10px] text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                >
                  {name}
                </div>
              </button>
            )
          })}
        </div>

        {/* Active country label */}
        {activeCountry && (
          <p className="text-xs text-teal-400 mt-2 font-medium">
            ✓ Filtering: {COUNTRIES.find(c => c.code === activeCountry)?.name}
          </p>
        )}
      </div>

      {/* Trending */}
      <div className="flex items-center justify-between glass-dark rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-orange-400" />
          <span className="text-xs text-gray-300">Trending: Gaming</span>
        </div>
        <span className="text-xs text-orange-400 font-bold">🔥 Hot</span>
      </div>

      {/* Duo Mode */}
      <div className="glass-dark rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserPlus size={14} className="text-violet-400" />
            <span className="text-sm font-semibold text-white">Duo Mode</span>
          </div>
          <button
            onClick={() => setDuoMode(!duoMode)}
            className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
              duoMode ? 'bg-violet-500' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
              duoMode ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>
        <p className="text-xs text-gray-500">Chat with a friend together</p>
        {duoMode && (
          <button className="mt-2 w-full py-1.5 rounded-lg gradient-btn text-white text-xs font-semibold">
            Invite Friend
          </button>
        )}
      </div>

    </div>
  )
}
