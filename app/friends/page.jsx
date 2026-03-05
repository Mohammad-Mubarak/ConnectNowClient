'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import {
  Users, UserPlus, Search, MessageSquare,
  Video, Phone, MoreHorizontal, Star,
  Filter, ChevronDown, Mic, X
} from 'lucide-react'

// ── Data ─────────────────────────────────────────
const FRIENDS = [
  { id:1, name:'Alex K.',   status:'online',  country:'🇺🇸', city:'New York',   mutuals:3,  avatar:'A', color:'from-teal-400 to-cyan-500',    bio:'Love meeting new people!'   },
  { id:2, name:'Priya S.',  status:'online',  country:'🇮🇳', city:'Mumbai',     mutuals:7,  avatar:'P', color:'from-violet-400 to-purple-500', bio:'Foodie & travel lover 🌍'   },
  { id:3, name:'Lucas M.',  status:'offline', country:'🇧🇷', city:'São Paulo',  mutuals:2,  avatar:'L', color:'from-green-400 to-teal-500',    bio:'Music & football fan ⚽'    },
  { id:4, name:'Yuki T.',   status:'online',  country:'🇯🇵', city:'Tokyo',      mutuals:5,  avatar:'Y', color:'from-pink-400 to-rose-500',     bio:'Anime & tech enthusiast 🎌' },
  { id:5, name:'Sara L.',   status:'away',    country:'🇩🇪', city:'Berlin',     mutuals:1,  avatar:'S', color:'from-amber-400 to-orange-500',  bio:'Art & coffee addict ☕'     },
  { id:6, name:'Omar F.',   status:'online',  country:'🇸🇦', city:'Riyadh',     mutuals:4,  avatar:'O', color:'from-blue-400 to-indigo-500',   bio:'Entrepreneur & dreamer 🚀'  },
  { id:7, name:'Mei C.',    status:'online',  country:'🇨🇳', city:'Shanghai',   mutuals:6,  avatar:'M', color:'from-teal-400 to-violet-400',   bio:'Language learner 📚'        },
  { id:8, name:'Jake R.',   status:'away',    country:'🇬🇧', city:'London',     mutuals:2,  avatar:'J', color:'from-rose-400 to-pink-500',     bio:'Night owl & gamer 🎮'       },
]

const STATUS = {
  online:  { color:'bg-green-400',  text:'text-green-400',  label:'Online'  },
  offline: { color:'bg-gray-500',   text:'text-gray-500',   label:'Offline' },
  away:    { color:'bg-yellow-400', text:'text-yellow-400', label:'Away'    },
}

// ── Call Modal ───────────────────────────────────
function CallModal({ friend, type, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(6,10,20,0.85)', backdropFilter:'blur(16px)' }}>
      <div className="relative w-full max-w-xs rounded-3xl p-7 flex flex-col items-center gap-5 overflow-hidden"
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 30px 80px rgba(0,0,0,0.5)' }}>
        {/* shimmer top */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.8),rgba(139,92,246,0.8),transparent)' }} />

        {/* Pulsing ring */}
        <div className="relative flex items-center justify-center">
          {[1,2,3].map(i => (
            <div key={i} className="absolute rounded-full border border-teal-400/20 animate-ping"
              style={{ width:56+i*28, height:56+i*28, animationDelay:`${i*0.3}s`, animationDuration:'2s' }} />
          ))}
          <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${friend.color} flex items-center justify-center text-3xl font-black text-white shadow-2xl`}>
            {friend.avatar}
          </div>
          <span className="absolute -bottom-1 -right-1 text-2xl">{friend.country}</span>
        </div>

        <div className="text-center">
          <p className="text-white font-black text-xl">{friend.name}</p>
          <p className="text-gray-400 text-sm mt-0.5">{friend.city}</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {type === 'video'
              ? <Video size={13} className="text-teal-400" />
              : type === 'voice'
              ? <Phone size={13} className="text-violet-400" />
              : <Mic size={13} className="text-pink-400" />
            }
            <p className="text-xs font-semibold"
              style={{ color: type==='video'?'#14b8a6':type==='voice'?'#8b5cf6':'#f472b6' }}>
              {type==='video'?'Video Call':type==='voice'?'Voice Call':'Voice Chat'} · Calling...
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button onClick={onClose}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
            <X size={22} className="text-red-400" />
          </button>
          <button
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: type==='video'?'rgba(20,184,166,0.2)':type==='voice'?'rgba(139,92,246,0.2)':'rgba(244,114,182,0.2)', border:`1px solid ${type==='video'?'rgba(20,184,166,0.4)':type==='voice'?'rgba(139,92,246,0.4)':'rgba(244,114,182,0.4)'}` }}>
            {type==='video' ? <Video size={22} className="text-teal-400" />
              : type==='voice' ? <Phone size={22} className="text-violet-400" />
              : <Mic size={22} className="text-pink-400" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Friend Card ──────────────────────────────────
function FriendCard({ friend, onCall }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const st = STATUS[friend.status]

  return (
    <div className="group relative rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01]"
      style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(16px)' }}>
      {/* hover shimmer */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background:'linear-gradient(135deg,rgba(20,184,166,0.03),rgba(139,92,246,0.03))' }} />

      <div className="relative flex items-center gap-3.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${friend.color} flex items-center justify-center text-xl font-black text-white shadow-lg`}>
            {friend.avatar}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${st.color} rounded-full border-2 border-[#080C18]`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-white font-bold text-sm leading-none">{friend.name}</p>
            <span className="text-sm leading-none">{friend.country}</span>
          </div>
          <p className="text-gray-500 text-[11px] truncate">{friend.city} · {friend.mutuals} mutuals</p>
          <div className={`flex items-center gap-1 mt-1.5`}>
            <span className={`w-1.5 h-1.5 ${st.color} rounded-full ${friend.status==='online'?'animate-pulse':''}`} />
            <span className={`text-[10px] font-semibold ${st.text}`}>{st.label}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Message */}
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
            title="Message">
            <MessageSquare size={14} className="text-gray-400 group-hover:text-white transition-colors" />
          </button>

          {/* Voice call */}
          <button
            onClick={() => onCall(friend, 'voice')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)' }}
            title="Voice Call">
            <Phone size={14} className="text-violet-400" />
          </button>

          {/* Video call */}
          <button
            onClick={() => onCall(friend, 'video')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.25)' }}
            title="Video Call">
            <Video size={14} className="text-teal-400" />
          </button>

          {/* More */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/10"
              style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
              <MoreHorizontal size={14} className="text-gray-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 z-20 w-40 rounded-2xl py-1.5 overflow-hidden"
                style={{ background:'rgba(15,20,35,0.95)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(20px)', boxShadow:'0 20px 40px rgba(0,0,0,0.4)' }}>
                {[
                  { icon:<Star size={12}/>,   label:'Favourite',      color:'text-yellow-400' },
                  { icon:<Mic size={12}/>,    label:'Voice chat',     color:'text-pink-400'   },
                  { icon:<UserPlus size={12}/>,label:'View profile',  color:'text-teal-400'   },
                  { icon:<X size={12}/>,      label:'Remove friend',  color:'text-red-400'    },
                ].map(({ icon, label, color }) => (
                  <button key={label}
                    onClick={() => setMenuOpen(false)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/5 ${color}`}>
                    {icon}{label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio strip */}
      <p className="relative text-gray-600 text-[10px] mt-3 pl-[68px] truncate group-hover:text-gray-400 transition-colors">
        {friend.bio}
      </p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────
export default function FriendsPage() {
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [callInfo, setCallInfo] = useState(null)   // { friend, type }
  const [sortOpen, setSortOpen] = useState(false)

  const onlineCount = FRIENDS.filter(f => f.status==='online').length

  const filtered = FRIENDS.filter(f => {
    const q = search.toLowerCase()
    const matchQ = f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q)
    const matchF = filter==='all' || f.status===filter
    return matchQ && matchF
  })

  return (
    <main className="min-h-screen bg-[#060A14] relative overflow-x-hidden">

      {/* Background orbs */}
      <div className="fixed w-[500px] h-[500px] rounded-full -top-40 -left-40 pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)', filter:'blur(40px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full bottom-0 right-0 pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(20,184,166,0.10) 0%,transparent 70%)', filter:'blur(40px)' }} />

      {/* Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.018]"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize:'44px 44px' }} />

      <Navbar />

      {callInfo && (
        <CallModal
          friend={callInfo.friend}
          type={callInfo.type}
          onClose={() => setCallInfo(null)}
        />
      )}

      <div className="relative z-10 pt-24 pb-16 px-4 max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          {/* Top row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.25)' }}>
                  <Users size={17} className="text-violet-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Friends</h1>
              </div>
              <p className="text-gray-500 text-sm ml-11">People you've connected with</p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 20px rgba(20,184,166,0.25)' }}>
              <UserPlus size={15} />
              Add
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              { val: FRIENDS.length,  label:'Total',   color:'#a78bfa', bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.18)' },
              { val: onlineCount,     label:'Online',  color:'#4ade80', bg:'rgba(74,222,128,0.08)', border:'rgba(74,222,128,0.18)' },
              { val: FRIENDS.reduce((a,f)=>a+f.mutuals,0), label:'Mutuals', color:'#14b8a6', bg:'rgba(20,184,166,0.08)', border:'rgba(20,184,166,0.18)' },
            ].map(({ val, label, color, bg, border }) => (
              <div key={label} className="flex flex-col items-center py-3 rounded-2xl"
                style={{ background:bg, border:`1px solid ${border}` }}>
                <p className="font-black text-xl" style={{ color }}>{val}</p>
                <p className="text-gray-500 text-[10px] mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Search + filter row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or city..."
                className="w-full pl-9 pr-4 py-3 rounded-2xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(12px)' }}
                onFocus={e => e.target.style.borderColor='rgba(20,184,166,0.4)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.07)'}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={13} className="text-gray-500 hover:text-white transition-colors" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button onClick={() => setSortOpen(o => !o)}
                className="h-full px-3.5 rounded-2xl flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-all hover:text-white"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <Filter size={13} />
                <ChevronDown size={11} className={`transition-transform ${sortOpen?'rotate-180':''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-12 z-20 w-36 rounded-2xl py-1.5 overflow-hidden"
                  style={{ background:'rgba(15,20,35,0.97)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(20px)', boxShadow:'0 20px 40px rgba(0,0,0,0.5)' }}>
                  {['all','online','away','offline'].map(f => (
                    <button key={f}
                      onClick={() => { setFilter(f); setSortOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/5"
                      style={{ color: filter===f ? '#14b8a6' : '#9ca3af' }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${f==='all'?'bg-gray-400':f==='online'?'bg-green-400':f==='away'?'bg-yellow-400':'bg-gray-500'}`} />
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                      {filter===f && <span className="ml-auto text-teal-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Online strip ── */}
        <div className="mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500 font-medium">
            <span className="text-green-400 font-bold">{onlineCount}</span> friends online
          </span>
          <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.04)' }} />
          <span className="text-[10px] text-gray-600">{filtered.length} shown</span>
        </div>

        {/* ── Friend cards ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <Users size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No friends found</p>
            <p className="text-gray-700 text-xs">Try a different search or filter</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map(friend => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onCall={(f, type) => setCallInfo({ friend:f, type })}
              />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-8 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
          style={{ background:'rgba(20,184,166,0.05)', border:'1px solid rgba(20,184,166,0.15)' }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.5),transparent)' }} />
          <div className="text-center sm:text-left">
            <p className="text-white font-bold text-sm">Find new strangers to connect with</p>
            <p className="text-gray-500 text-xs mt-0.5">Start a random video or voice chat now</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 20px rgba(20,184,166,0.25)' }}>
            <Video size={14} />
            Start Chat
          </button>
        </div>

      </div>
    </main>
  )
}
