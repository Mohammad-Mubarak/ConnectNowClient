import Navbar from '@/components/Navbar'
import { Compass, TrendingUp, Users, Flame } from 'lucide-react'

const categories = [
  { icon: '🎮', label: 'Gaming', count: '142K online', color: 'teal' },
  { icon: '🎵', label: 'Music', count: '98K online', color: 'violet' },
  { icon: '🌍', label: 'Travel', count: '76K online', color: 'blue' },
  { icon: '💻', label: 'Tech', count: '210K online', color: 'teal' },
  { icon: '🎨', label: 'Art', count: '54K online', color: 'violet' },
  { icon: '📚', label: 'Books', count: '33K online', color: 'blue' },
  { icon: '🏋️', label: 'Fitness', count: '61K online', color: 'teal' },
  { icon: '🍕', label: 'Food', count: '45K online', color: 'violet' },
  { icon: '🎬', label: 'Movies', count: '88K online', color: 'blue' },
  { icon: '🐶', label: 'Pets', count: '27K online', color: 'teal' },
  { icon: '🚀', label: 'Science', count: '39K online', color: 'violet' },
  { icon: '⚽', label: 'Sports', count: '115K online', color: 'blue' },
]

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#080C18] relative">
      <div className="orb w-96 h-96 bg-teal-500 top-20 -left-32"></div>
      <div className="orb w-80 h-80 bg-violet-600 top-40 right-0" style={{ animationDelay: '3s' }}></div>

      <Navbar />

      <div className="relative z-10 pt-24 px-4 md:px-6 pb-10 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Compass size={28} className="text-teal-400" />
            <h1 className="text-3xl font-bold text-white">Explore</h1>
          </div>
          <p className="text-gray-400">Find people who share your interests</p>
        </div>

        {/* Trending Banner */}
        <div className="glass border border-orange-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Flame size={20} className="text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">🔥 Trending Now: Gaming & Tech</p>
            <p className="text-gray-400 text-xs">Over 350K users currently chatting in these categories</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Users size={14} className="text-green-400" />
            <span className="text-green-400 text-sm font-bold">2.4M online</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Chats', value: '840K', icon: '💬' },
            { label: 'Countries', value: '190+', icon: '🌍' },
            { label: 'Avg Match Time', value: '3s', icon: '⚡' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass rounded-2xl p-4 border border-white/6 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Browse by Interest</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(({ icon, label, count, color }) => (
            <button
              key={label}
              className={`glass border rounded-2xl p-5 text-left hover:bg-white/5 transition-all duration-200 group ${
                color === 'teal'
                  ? 'border-teal-500/20 hover:border-teal-500/40'
                  : color === 'violet'
                  ? 'border-violet-500/20 hover:border-violet-500/40'
                  : 'border-blue-500/20 hover:border-blue-500/40'
              }`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{count}</p>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
