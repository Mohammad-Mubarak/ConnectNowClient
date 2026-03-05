'use client'
import { useState } from 'react'
import { Sparkles, Plus } from 'lucide-react'

const INTERESTS = [
  { icon: '🎮', label: 'Gaming' },
  { icon: '🎵', label: 'Music' },
  { icon: '🌍', label: 'Travel' },
  { icon: '💻', label: 'Tech' },
  { icon: '🎨', label: 'Art' },
  { icon: '📚', label: 'Books' },
  { icon: '🏋️', label: 'Fitness' },
  { icon: '🍕', label: 'Food' },
]

export default function InterestSidebar() {
  const [selected, setSelected] = useState(['Gaming', 'Tech'])
  const [smartMatch, setSmartMatch] = useState(true)

  const toggle = (label) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    )
  }

  return (
    <div className="glass rounded-2xl p-4 border border-white/6 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-teal-400" />
          <span className="text-sm font-semibold text-white">Smart Match</span>
        </div>
        <button
          onClick={() => setSmartMatch(!smartMatch)}
          className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
            smartMatch ? 'bg-teal-500' : 'bg-gray-600'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
            smartMatch ? 'left-5' : 'left-0.5'
          }`} />
        </button>
      </div>

      <p className="text-xs text-gray-500">Match with people who share your interests</p>

      <div className="flex flex-wrap gap-2">
        {INTERESTS.map(({ icon, label }) => (
          <button
            key={label}
            onClick={() => toggle(label)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              selected.includes(label)
                ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300'
                : 'glass border border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200'
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <button className="flex items-center justify-center gap-2 py-2 rounded-xl glass border border-dashed border-white/20 text-gray-500 hover:text-gray-300 hover:border-white/30 transition-all text-xs">
        <Plus size={12} />
        Add Interest
      </button>
    </div>
  )
}
