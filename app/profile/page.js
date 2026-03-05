'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  Zap, MapPin, Wifi, Edit3, Camera, Share2,
  Clock, ChevronRight, Copy, Check, Plus, X,
  Video, MessageSquare
} from 'lucide-react'

const STATS = [
  { val: '1,284', label: 'Chats',     color: '#14b8a6', bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.18)'  },
  { val: '340',   label: 'Friends',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)' },
  { val: '4.9',   label: 'Rating',    color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.18)'  },
  { val: '48',    label: 'Countries', color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.18)' },
]

const RECENT = [
  { name: 'Alex K.',  country: '🇺🇸', time: '2m ago',    type: 'video', color: 'from-teal-400 to-cyan-500'    },
  { name: 'Yuki T.',  country: '🇯🇵', time: '1h ago',    type: 'voice', color: 'from-pink-400 to-rose-500'    },
  { name: 'Sara L.',  country: '🇩🇪', time: '3h ago',    type: 'chat',  color: 'from-amber-400 to-orange-500' },
  { name: 'Omar F.',  country: '🇸🇦', time: 'Yesterday', type: 'video', color: 'from-blue-400 to-indigo-500'  },
]

const PRESET_INTERESTS = [
  'Travel ✈️', 'Music 🎵', 'Tech 💻', 'Coding 🔧',
  'Photography 📸', 'Gaming 🎮', 'Food 🍜', 'Books 📚',
  'Fitness 🏋️', 'Movies 🎬', 'Art 🎨', 'Sports ⚽',
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} className="text-gray-500" />}
    </button>
  )
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('activity')
  const [interests, setInterests] = useState(['Travel ✈️', 'Music 🎵', 'Tech 💻', 'Coding 🔧', 'Photography 📸', 'Gaming 🎮', 'Food 🍜', 'Books 📚'])
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const removeInterest = (tag) => setInterests(prev => prev.filter(t => t !== tag))
  const addInterest = (tag) => { if (!interests.includes(tag)) setInterests(prev => [...prev, tag]) }
  const addCustom = () => {
    const v = customInput.trim()
    if (v && !interests.includes(v)) { setInterests(prev => [...prev, v]); setCustomInput('') }
  }
  const available = PRESET_INTERESTS.filter(t => !interests.includes(t))

  return (
    <main className="min-h-screen bg-[#060A14] relative overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed w-[500px] h-[500px] rounded-full -top-52 -left-52 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full -bottom-32 -right-32 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(20,184,166,0.07) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      <Navbar />

      <div className="relative z-10 pt-20 pb-20 px-4 max-w-lg mx-auto space-y-3">

        {/* ── HERO ── */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Top accent line */}
          <div className="h-px w-full"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(20,184,166,0.7),rgba(139,92,246,0.7),transparent)' }} />

          {/* Banner */}
          <div className="h-24 relative"
            style={{ background: 'linear-gradient(135deg,#0c1a35 0%,#1a0b2e 50%,#091e15 100%)' }}>
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 25% 60%,rgba(20,184,166,0.25) 0%,transparent 55%), radial-gradient(ellipse at 75% 40%,rgba(139,92,246,0.25) 0%,transparent 55%)' }} />
            <button className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold text-gray-300"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <Camera size={10} /> Edit cover
            </button>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-9 mb-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg,#14b8a6,#8b5cf6)', filter: 'blur(10px)', opacity: 0.45, margin: '-3px' }} />
                <div className="relative w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center text-2xl font-black text-white border-[3px] border-[#060A14]">
                  M
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#060A14]" />
                <button className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#060A14]"
                  style={{ background: 'linear-gradient(135deg,#14b8a6,#8b5cf6)' }}>
                  <Edit3 size={9} className="text-white" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-8">
                <button className="p-2 rounded-xl text-gray-400 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Share2 size={14} />
                </button>
                <Link href="/settings">
                  <button className="px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow: '0 0 18px rgba(20,184,166,0.25)' }}>
                    <Edit3 size={11} /> Edit Profile
                  </button>
                </Link>
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-white text-xl font-black tracking-tight">Manik</h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1"
                  style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#14b8a6' }}>
                  <Zap size={7} /> PRO
                </span>
              </div>
              <p className="text-gray-500 text-xs mb-2">@manik_connectnow</p>
              <p className="text-gray-400 text-[13px] leading-relaxed">Full-stack dev 💻 · WebRTC enthusiast · Meeting people from 🌍</p>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-blue-300"
                style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <MapPin size={10} /> 🇮🇳 Hyderabad
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-gray-400"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Wifi size={10} /> Airtel
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-teal-300"
                style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.14)' }}>
                <Clock size={10} /> Since Jan 2024
              </span>
            </div>

            {/* Profile ID */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)' }}>
              <span className="text-gray-600 text-[9px] font-semibold uppercase tracking-widest">ID</span>
              <code className="text-teal-400 text-[11px] font-mono flex-1">@manik_connectnow</code>
              <CopyButton text="@manik_connectnow" />
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-4 gap-2">
          {STATS.map(({ val, label, color, bg, border }) => (
            <div key={label} className="flex flex-col items-center py-4 rounded-2xl"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <p className="font-black text-lg leading-none" style={{ color }}>{val}</p>
              <p className="text-gray-500 text-[10px] mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 p-1 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['activity', 'interests', 'about'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200"
              style={{
                background: activeTab === tab ? 'linear-gradient(135deg,rgba(20,184,166,0.18),rgba(139,92,246,0.18))' : 'transparent',
                color: activeTab === tab ? '#e2e8f0' : '#4b5563',
                border: activeTab === tab ? '1px solid rgba(20,184,166,0.25)' : '1px solid transparent',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── ACTIVITY ── */}
        {activeTab === 'activity' && (
          <div className="space-y-2">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest font-bold px-1">Recent Chats</p>
            {RECENT.map(({ name, country, time, type, color }) => (
              <div key={name}
                className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all hover:bg-white/[0.03]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.055)' }}>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
                  {name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <span className="text-base">{country}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {type === 'video'
                      ? <Video size={10} className="text-teal-400" />
                      : type === 'voice'
                      ? <Zap size={10} className="text-violet-400" />
                      : <MessageSquare size={10} className="text-pink-400" />}
                    <span className="text-gray-500 text-[10px] capitalize">{type}</span>
                    <span className="text-gray-700 text-[10px]">·</span>
                    <span className="text-gray-500 text-[10px]">{time}</span>
                  </div>
                </div>
                <ChevronRight size={13} className="text-gray-700 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* ── INTERESTS ── */}
        {activeTab === 'interests' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Your Interests</p>
              <button
                onClick={() => setShowAddPanel(p => !p)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all"
                style={{
                  background: showAddPanel ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${showAddPanel ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  color: showAddPanel ? '#14b8a6' : '#9ca3af',
                }}>
                {showAddPanel ? <X size={10} /> : <Plus size={10} />}
                {showAddPanel ? 'Close' : 'Add'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {interests.map(tag => (
                <span key={tag}
                  className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-2xl text-xs font-semibold cursor-default transition-all hover:scale-[1.03]"
                  style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', color: '#5eead4' }}>
                  {tag}
                  <button
                    onClick={() => removeInterest(tag)}
                    className="w-4 h-4 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    style={{ color: '#f87171' }}>
                    <X size={9} />
                  </button>
                </span>
              ))}
              {interests.length === 0 && (
                <p className="text-gray-600 text-sm px-1">No interests added yet.</p>
              )}
            </div>

            {showAddPanel && (
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.14)' }}>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustom()}
                    placeholder="Type a custom interest…"
                    className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                  />
                  <button
                    onClick={addCustom}
                    disabled={!customInput.trim()}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-30 transition-all hover:scale-[1.04]"
                    style={{ background: 'linear-gradient(135deg,#14b8a6,#8b5cf6)' }}>
                    <Plus size={13} />
                  </button>
                </div>

                {available.length > 0 && (
                  <div>
                    <p className="text-gray-600 text-[9px] uppercase tracking-widest font-bold mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {available.map(tag => (
                        <button key={tag}
                          onClick={() => addInterest(tag)}
                          className="flex items-center gap-1 pl-2.5 pr-2 py-1 rounded-2xl text-[11px] font-semibold transition-all hover:scale-[1.05] active:scale-95"
                          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#c4b5fd' }}>
                          {tag} <Plus size={9} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {available.length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-1">All suggestions added!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ABOUT ── */}
        {activeTab === 'about' && (
          <div className="space-y-2">
            {[
              { label: 'Full Name',  value: 'Manik',                    icon: '👤' },
              { label: 'Location',   value: 'Hyderabad, Telangana, IN', icon: '📍' },
              { label: 'Timezone',   value: 'IST (UTC+5:30)',           icon: '🕐' },
              { label: 'Languages',  value: 'English, Hindi, Telugu',   icon: '🗣️' },
              { label: 'Joined',     value: 'January 2024',             icon: '📅' },
              { label: 'Profession', value: 'Software Engineer',        icon: '💼' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.055)' }}>
                <span className="text-lg w-8 text-center flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-[9px] font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-white text-sm font-semibold truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
