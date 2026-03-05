'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  ChevronLeft, ChevronRight, Check, X, Loader2,
  AlertTriangle, CheckCircle, Info, RefreshCw,
  Eye, EyeOff, Search, UserX, Shield
} from 'lucide-react'

// ─────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold shadow-2xl pointer-events-auto"
          style={{
            background:    t.type==='success'?'rgba(20,184,166,0.15)':t.type==='error'?'rgba(239,68,68,0.15)':'rgba(139,92,246,0.15)',
            border:       `1px solid ${t.type==='success'?'rgba(20,184,166,0.4)':t.type==='error'?'rgba(239,68,68,0.4)':'rgba(139,92,246,0.4)'}`,
            backdropFilter:'blur(20px)',
            color:         t.type==='success'?'#5eead4':t.type==='error'?'#fca5a5':'#c4b5fd',
            boxShadow:    '0 20px 40px rgba(0,0,0,0.4)',
          }}>
          {t.type==='success'?<CheckCircle size={15}/>:t.type==='error'?<AlertTriangle size={15}/>:<Info size={15}/>}
          {t.msg}
          <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100">
            <X size={13}/>
          </button>
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (msg, type='success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }
  const remove = id => setToasts(t => t.filter(x => x.id !== id))
  return { toasts, toast: add, remove }
}

// ─────────────────────────────────────────────────
// REUSABLE UI
// ─────────────────────────────────────────────────
function Toggle({ value, onChange, color='#14b8a6', disabled=false }) {
  return (
    <button onClick={() => !disabled && onChange(!value)} disabled={disabled}
      className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 disabled:opacity-40"
      style={{
        background: value ? color : 'rgba(255,255,255,0.1)',
        border: `1px solid ${value ? color : 'rgba(255,255,255,0.12)'}`,
        boxShadow: value ? `0 0 10px ${color}44` : 'none',
      }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300"
        style={{ left: value ? 'calc(100% - 22px)' : '2px' }} />
    </button>
  )
}

function Slider({ value, onChange, min=0, max=100, color='#14b8a6' }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
      style={{ accentColor: color, background:`linear-gradient(to right,${color} ${pct}%,rgba(255,255,255,0.08) ${pct}%)` }}
    />
  )
}

function Section({ title, icon, children, accent='teal' }) {
  const colors = {
    teal:   { bg:'rgba(20,184,166,0.1)',  border:'rgba(20,184,166,0.25)'  },
    violet: { bg:'rgba(139,92,246,0.1)',  border:'rgba(139,92,246,0.25)' },
    pink:   { bg:'rgba(244,114,182,0.1)', border:'rgba(244,114,182,0.25)'},
    amber:  { bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.25)' },
  }
  const c = colors[accent] || colors.teal
  return (
    <div className="rounded-3xl overflow-hidden mb-3"
      style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.015)' }}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-base"
          style={{ background:c.bg, border:`1px solid ${c.border}` }}>
          {icon}
        </div>
        <p className="text-white font-bold text-sm">{title}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Divider() {
  return <div className="mx-4 h-px" style={{ background:'rgba(255,255,255,0.04)' }} />
}

function ToggleRow({ label, sub, icon, value, onChange, color='#14b8a6', badge }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
      {icon && <span className="text-base w-6 text-center flex-shrink-0 select-none">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{label}</p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background:'rgba(20,184,166,0.15)', color:'#14b8a6', border:'1px solid rgba(20,184,166,0.3)' }}>
              {badge}
            </span>
          )}
        </div>
        {sub && <p className="text-gray-600 text-[10px] mt-0.5 leading-relaxed">{sub}</p>}
      </div>
      <Toggle value={value} onChange={onChange} color={color} />
    </div>
  )
}

function SliderRow({ label, sub, icon, value, onChange, min=0, max=100, suffix='%', color='#14b8a6' }) {
  return (
    <div className="px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        {icon && <span className="text-base w-6 text-center flex-shrink-0 select-none">{icon}</span>}
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{label}</p>
          {sub && <p className="text-gray-600 text-[10px] mt-0.5">{sub}</p>}
        </div>
        <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
          style={{ background:'rgba(255,255,255,0.05)', color }}>
          {value}{suffix}
        </span>
      </div>
      <div className="pl-9">
        <Slider value={value} onChange={onChange} min={min} max={max} color={color} />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-700">{min}{suffix}</span>
          <span className="text-[9px] text-gray-700">{max}{suffix}</span>
        </div>
      </div>
    </div>
  )
}

function SelectRow({ label, icon, value, options, onChange, colorMap }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
      {icon && <span className="text-base w-6 text-center flex-shrink-0 select-none">{icon}</span>}
      <p className="text-white text-sm font-medium flex-1">{label}</p>
      <div className="flex gap-1.5">
        {options.map(opt => {
          const active = value === opt
          const col    = colorMap?.[opt] || '#14b8a6'
          return (
            <button key={opt} onClick={() => onChange(opt)}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: active ? `${col}22` : 'rgba(255,255,255,0.04)',
                border:     `1px solid ${active ? col : 'rgba(255,255,255,0.08)'}`,
                color:       active ? col : '#6b7280',
                boxShadow:   active ? `0 0 10px ${col}33` : 'none',
              }}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InputRow({ label, sub, icon, value, onChange, placeholder, type='text', onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const [local,   setLocal]   = useState(value)
  const inputRef              = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const save = async () => {
    await onSave?.(local)
    onChange(local)
    setEditing(false)
  }
  const cancel = () => { setLocal(value); setEditing(false) }

  return (
    <div className="px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-base w-6 text-center flex-shrink-0 select-none">{icon}</span>}
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{label}</p>
          {sub && <p className="text-gray-600 text-[10px] mt-0.5">{sub}</p>}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
            style={{ background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.25)', color:'#14b8a6' }}>
            Edit
          </button>
        )}
      </div>
      <div className="pl-9">
        {editing ? (
          <div className="flex gap-2">
            <input ref={inputRef} type={type} value={local}
              onChange={e => setLocal(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(20,184,166,0.4)' }}
              onKeyDown={e => { if(e.key==='Enter') save(); if(e.key==='Escape') cancel() }}
            />
            <button onClick={save} disabled={saving}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)' }}>
              {saving ? <Loader2 size={13} className="animate-spin"/> : <Check size={13}/>}
            </button>
            <button onClick={cancel}
              className="px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#9ca3af' }}>
              <X size={13}/>
            </button>
          </div>
        ) : (
          <p className="text-gray-400 text-sm truncate">
            {value || <span className="text-gray-600 italic">Not set</span>}
          </p>
        )}
      </div>
    </div>
  )
}

function ActionRow({ label, sub, icon, onClick, loading, danger, badge }) {
  return (
    <button onClick={onClick} disabled={loading}
      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left ${danger?'hover:bg-red-500/5':'hover:bg-white/[0.02]'} disabled:opacity-50`}>
      {icon && <span className="text-base w-6 text-center flex-shrink-0 select-none">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${danger?'text-red-400':'text-white'}`}>{label}</p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background:'rgba(20,184,166,0.15)', color:'#14b8a6', border:'1px solid rgba(20,184,166,0.3)' }}>
              {badge}
            </span>
          )}
        </div>
        {sub && <p className="text-gray-600 text-[10px] mt-0.5 leading-relaxed">{sub}</p>}
      </div>
      {loading
        ? <Loader2 size={14} className="text-gray-500 animate-spin flex-shrink-0"/>
        : <ChevronRight size={14} className={`flex-shrink-0 ${danger?'text-red-700':'text-gray-700'}`}/>}
    </button>
  )
}

// ─────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(12px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden relative"
        style={{ background:'rgba(8,12,24,0.98)', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 30px 80px rgba(0,0,0,0.6)' }}>
        <div className="h-px" style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.7),rgba(139,92,246,0.7),transparent)' }}/>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white font-black text-base">{title}</p>
          <button onClick={onClose}
            className="p-1.5 rounded-xl transition-all hover:bg-white/10"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <X size={15} className="text-gray-400"/>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel='Confirm', danger=false, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-gray-400 text-sm leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-400 transition-all hover:bg-white/10"
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{
            background: danger ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg,#14b8a6,#8b5cf6)',
            border:     danger ? '1px solid rgba(239,68,68,0.4)' : undefined,
          }}>
          {loading ? <Loader2 size={15} className="animate-spin mx-auto"/> : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────────────
// BLOCKED USERS MODAL (with search)
// ─────────────────────────────────────────────────
function BlockedUsersModal({ open, onClose, toast }) {
  const [blocked, setBlocked] = useState([
    { id:1, name:'spam_bot_99',   country:'🇺🇸', blockedAt:'2 days ago'  },
    { id:2, name:'troll123',      country:'🇬🇧', blockedAt:'1 week ago'  },
    { id:3, name:'fake_user_22',  country:'🇩🇪', blockedAt:'2 weeks ago' },
    { id:4, name:'rude_person',   country:'🇧🇷', blockedAt:'1 month ago' },
    { id:5, name:'harasser_99',   country:'🇫🇷', blockedAt:'1 month ago' },
  ])
  const [search,     setSearch]     = useState('')
  const [unblocking, setUnblocking] = useState(null)

  const filtered = blocked.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleUnblock = async (id, name) => {
    setUnblocking(id)
    await new Promise(r => setTimeout(r, 900))
    setBlocked(b => b.filter(u => u.id !== id))
    setUnblocking(null)
    toast(`@${name} has been unblocked`, 'info')
  }

  return (
    <Modal open={open} onClose={onClose} title="Blocked Users">
      {/* Search bar */}
      <div className="relative mb-3">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search blocked users..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white outline-none transition-all"
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
          onFocus={e  => e.target.style.borderColor='rgba(20,184,166,0.4)'}
          onBlur={e   => e.target.style.borderColor='rgba(255,255,255,0.08)'}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={12} className="text-gray-500 hover:text-white transition-colors"/>
          </button>
        )}
      </div>

      {/* Count strip */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[10px] text-gray-600 font-medium">
          {filtered.length} of {blocked.length} user{blocked.length!==1?'s':''}
          {search && ` matching "${search}"`}
        </span>
        {blocked.length > 0 && (
          <button
            onClick={async () => {
              for (const u of [...blocked]) await handleUnblock(u.id, u.name)
            }}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors">
            Unblock all
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-0.5"
        style={{ scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.08) transparent' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              {search ? '🔍' : '✅'}
            </div>
            <p className="text-gray-500 text-sm font-medium">
              {search ? 'No results found' : 'No blocked users'}
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-teal-400 text-xs hover:text-teal-300 transition-colors">
                Clear search
              </button>
            )}
          </div>
        ) : (
          filtered.map(u => (
            <div key={u.id}
              className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-white/[0.02]"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,rgba(107,114,128,0.4),rgba(75,85,99,0.4))', border:'1px solid rgba(255,255,255,0.08)' }}>
                {u.name[0].toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-xs font-bold truncate">@{u.name}</p>
                  <span className="text-sm flex-shrink-0">{u.country}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <UserX size={9} className="text-red-500 flex-shrink-0"/>
                  <p className="text-gray-600 text-[10px]">Blocked {u.blockedAt}</p>
                </div>
              </div>
              {/* Unblock btn */}
              <button
                onClick={() => handleUnblock(u.id, u.name)}
                disabled={unblocking === u.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex-shrink-0"
                style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>
                {unblocking === u.id
                  ? <Loader2 size={10} className="animate-spin"/>
                  : <><X size={9}/>Unblock</>
                }
              </button>
            </div>
          ))
        )}
      </div>

      {/* Highlight match in search */}
      {search && filtered.length > 0 && (
        <p className="text-[10px] text-gray-700 text-center mt-3">
          Showing results for <span className="text-teal-500">"{search}"</span>
        </p>
      )}
    </Modal>
  )
}

// ─────────────────────────────────────────────────
// PASSWORD FORM
// ─────────────────────────────────────────────────
function PasswordForm({ onClose, toast }) {
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const strength      = !next ? 0 : next.length < 6 ? 1 : next.length < 10 ? 2 : /[^a-zA-Z0-9]/.test(next) ? 4 : 3
  const strengthLabel = ['','Weak','Fair','Strong','Very strong']
  const strengthColor = ['','#ef4444','#f59e0b','#22c55e','#14b8a6']

  const handleSave = async () => {
    setError('')
    if (!current)           return setError('Enter your current password')
    if (next.length < 6)    return setError('Password must be at least 6 characters')
    if (next !== confirm)   return setError('Passwords do not match')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    toast('Password updated successfully 🔑')
    onClose()
  }

  return (
    <div className="flex flex-col gap-3">
      {[
        { label:'Current password', val:current, set:setCurrent },
        { label:'New password',     val:next,    set:setNext    },
        { label:'Confirm new',      val:confirm, set:setConfirm },
      ].map(({ label, val, set }) => (
        <div key={label} className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={val} onChange={e => set(e.target.value)}
            placeholder={label}
            className="w-full px-4 py-3 rounded-2xl text-sm text-white outline-none transition-all"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
            onFocus={e => e.target.style.borderColor='rgba(20,184,166,0.4)'}
            onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.08)'}
          />
        </div>
      ))}

      {/* Strength meter */}
      {next && (
        <div className="px-1">
          <div className="flex gap-1 mb-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ background: i<=strength ? strengthColor[strength] : 'rgba(255,255,255,0.08)' }}/>
            ))}
          </div>
          <p className="text-[10px] font-semibold" style={{ color:strengthColor[strength] }}>
            {strengthLabel[strength]}
          </p>
        </div>
      )}

      {/* Show/hide */}
      <button onClick={() => setShowPw(p=>!p)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors self-start">
        {showPw ? <EyeOff size={12}/> : <Eye size={12}/>}
        {showPw ? 'Hide' : 'Show'} passwords
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-red-400"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={12}/>{error}
        </div>
      )}

      <button onClick={handleSave} disabled={loading}
        className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-60 mt-1"
        style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 20px rgba(20,184,166,0.2)' }}>
        {loading ? <Loader2 size={16} className="animate-spin mx-auto"/> : 'Update Password'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────
export default function SettingsPage() {
  const { toasts, toast, remove } = useToast()

  // ── Profile ─────────────────────────────────────
  const [displayName,   setDisplayName]   = useState('Manik')
  const [bio,           setBio]           = useState('Full-stack dev 💻 | Love meeting people 🌍')
  const [showEmail,     setShowEmail]     = useState(true)
  const [showLocation,  setShowLocation]  = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)
  const [savingName,    setSavingName]    = useState(false)
  const [savingBio,     setSavingBio]     = useState(false)

  // ── Notifications ───────────────────────────────
  const [notifChat,    setNotifChat]    = useState(true)
  const [notifFriend,  setNotifFriend]  = useState(true)
  const [notifMatch,   setNotifMatch]   = useState(true)
  const [notifSound,   setNotifSound]   = useState(true)
  const [notifVibrate, setNotifVibrate] = useState(false)
  const [notifEmail,   setNotifEmail]   = useState(false)
  const [quietHours,   setQuietHours]   = useState(false)

  // ── Privacy ─────────────────────────────────────
  const [onlineStatus, setOnlineStatus] = useState(true)
  const [readReceipts, setReadReceipts] = useState(true)
  const [anonMode,     setAnonMode]     = useState(false)
  const [dataSharing,  setDataSharing]  = useState(false)

  // ── Audio & Video ───────────────────────────────
  const [camQuality, setCamQuality] = useState('HD')
  const [micVol,     setMicVol]     = useState(80)
  const [speakerVol, setSpeakerVol] = useState(75)
  const [noiseSup,   setNoiseSup]   = useState(true)
  const [echoCan,    setEchoCan]    = useState(true)
  const [mirrorCam,  setMirrorCam]  = useState(false)
  const [autoMute,   setAutoMute]   = useState(false)
  const [testingAV,  setTestingAV]  = useState(false)

  // ── Modals ──────────────────────────────────────
  const [showDeleteModal,   setShowDeleteModal]   = useState(false)
  const [showLogoutModal,   setShowLogoutModal]   = useState(false)
  const [showBlockedModal,  setShowBlockedModal]  = useState(false)
  const [showSessionModal,  setShowSessionModal]  = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [deleteLoading,     setDeleteLoading]     = useState(false)
  const [logoutLoading,     setLogoutLoading]     = useState(false)

  const fakeSave = (ms=900) => new Promise(r => setTimeout(r, ms))

  const saveField = async (field, setLoading) => {
    setLoading(true)
    await fakeSave()
    setLoading(false)
    toast(`${field} updated ✓`)
  }

  const handleToggle = (setter, label, val) => {
    setter(val)
    toast(`${label} ${val?'enabled':'disabled'}`, 'info')
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    await fakeSave(1800)
    setDeleteLoading(false)
    setShowDeleteModal(false)
    toast('Account deleted. Redirecting...', 'error')
  }

  const handleLogoutAll = async () => {
    setLogoutLoading(true)
    await fakeSave(1200)
    setLogoutLoading(false)
    setShowLogoutModal(false)
    toast('Signed out from all devices ✓')
  }

  const sessions = [
    { device:'Chrome · Windows',    location:'Hyderabad, IN', time:'Now',       current:true  },
    { device:'Mobile App · Android', location:'Hyderabad, IN', time:'2h ago',   current:false },
    { device:'Firefox · Mac',        location:'Mumbai, IN',    time:'3 days ago',current:false },
  ]

  return (
    <main className="min-h-screen bg-[#060A14] relative overflow-x-hidden">

      {/* BG glows */}
      <div className="fixed w-[500px] h-[500px] rounded-full -top-60 -right-40 pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(139,92,246,0.08),transparent 70%)', filter:'blur(60px)' }}/>
      <div className="fixed w-[400px] h-[400px] rounded-full -bottom-40 -left-40 pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(20,184,166,0.08),transparent 70%)', filter:'blur(60px)' }}/>
      <div className="fixed inset-0 pointer-events-none opacity-[0.018]"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize:'44px 44px' }}/>

      <Navbar />
      <Toast toasts={toasts} remove={remove} />

      <div className="relative z-10 pt-20 pb-20 px-4 max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <ChevronLeft size={16} className="text-gray-400"/>
            </button>
          </Link>
          <div>
            <h1 className="text-white text-xl font-black tracking-tight">Settings</h1>
            <p className="text-gray-600 text-xs">All changes save instantly</p>
          </div>
        </div>

        {/* Profile mini card */}
        <div className="flex items-center gap-3.5 p-4 rounded-3xl mb-5 relative overflow-hidden"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.6),rgba(139,92,246,0.6),transparent)' }}/>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center text-2xl font-black text-white">
              {displayName[0]}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#060A14]"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-base truncate">{displayName}</p>
            <p className="text-gray-500 text-xs">manik@example.com</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 bg-teal-400 rounded-full animate-pulse"/>
              <p className="text-teal-400 text-[10px] font-semibold">🇮🇳 Hyderabad · Airtel Broadband</p>
            </div>
          </div>
          <Link href="/profile">
            <button className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all hover:scale-105"
              style={{ background:'linear-gradient(135deg,rgba(20,184,166,0.2),rgba(139,92,246,0.2))', border:'1px solid rgba(20,184,166,0.3)' }}>
              View
            </button>
          </Link>
        </div>

        {/* ══ PROFILE ══ */}
        <Section title="Profile" icon="👤" accent="teal">
          <InputRow
            label="Display Name" sub="How others see you in chats"
            icon="✏️" value={displayName} onChange={setDisplayName}
            placeholder="Enter display name" saving={savingName}
            onSave={() => saveField('Display name', setSavingName)}
          />
          <Divider/>
          <InputRow
            label="Bio" sub="Tell people a bit about yourself"
            icon="📝" value={bio} onChange={setBio}
            placeholder="Enter your bio" saving={savingBio}
            onSave={() => saveField('Bio', setSavingBio)}
          />
          <Divider/>
          <ToggleRow label="Show email publicly"  sub="Others can see your email"         icon="👁️" value={showEmail}     onChange={v=>handleToggle(setShowEmail,'Show email',v)}    />
          <Divider/>
          <ToggleRow label="Show location"        sub="Display your city on profile"       icon="📍" value={showLocation}  onChange={v=>handleToggle(setShowLocation,'Location',v)}   />
          <Divider/>
          <ToggleRow label="Public profile"       sub="Anyone can view your profile"       icon="🌐" value={publicProfile} onChange={v=>handleToggle(setPublicProfile,'Public profile',v)}/>
          <Divider/>
          <ActionRow label="Change avatar" sub="Upload a new profile photo" icon="📸"
            onClick={() => toast('Avatar upload opened 📸','info')}/>
        </Section>

        {/* ══ PRIVACY & SAFETY ══ */}
        <Section title="Privacy & Safety" icon="🔒" accent="pink">
          <ToggleRow label="Show online status" sub="Let friends see when you're active"    icon="🟢" value={onlineStatus} onChange={v=>handleToggle(setOnlineStatus,'Online status',v)} color="#f472b6"/>
          <Divider/>
          <ToggleRow label="Read receipts"      sub="Show ✓✓ when you've read messages"    icon="👁️" value={readReceipts} onChange={v=>handleToggle(setReadReceipts,'Read receipts',v)} color="#f472b6"/>
          <Divider/>
          <ToggleRow label="Anonymous mode"     sub="Hide your identity in random matches"  icon="🕵️" value={anonMode}     onChange={v=>handleToggle(setAnonMode,'Anonymous mode',v)}    color="#f472b6"/>
          <Divider/>
          <ToggleRow label="Data sharing"       sub="Help improve ConnectNow with usage data" icon="📊" value={dataSharing} onChange={v=>handleToggle(setDataSharing,'Data sharing',v)}  color="#f472b6"/>
          <Divider/>
          <ActionRow
            label="Blocked users"
            sub="Search & manage your blocked list"
            icon="🚫"
            badge="5"
            onClick={() => setShowBlockedModal(true)}
          />
        </Section>

        {/* ══ AUDIO & VIDEO ══ */}
        <Section title="Audio & Video" icon="🎥" accent="teal">
          <SelectRow label="Camera quality" icon="📷"
            value={camQuality} options={['SD','HD','4K']}
            onChange={v => { setCamQuality(v); toast(`Camera set to ${v}`,'info') }}
            colorMap={{ SD:'#6b7280', HD:'#14b8a6', '4K':'#8b5cf6' }}
          />
          <Divider/>
          <SliderRow label="Microphone volume" sub="Input gain"  icon="🎤" value={micVol}     onChange={setMicVol}     color="#14b8a6"/>
          <Divider/>
          <SliderRow label="Speaker volume"    sub="Output level" icon="🔊" value={speakerVol} onChange={setSpeakerVol} color="#8b5cf6"/>
          <Divider/>
          <ToggleRow label="Noise suppression" sub="Remove background noise"        icon="🎧" value={noiseSup}  onChange={v=>handleToggle(setNoiseSup,'Noise suppression',v)} />
          <Divider/>
          <ToggleRow label="Echo cancellation" sub="Prevent audio feedback"         icon="🔇" value={echoCan}   onChange={v=>handleToggle(setEchoCan,'Echo cancellation',v)}  />
          <Divider/>
          <ToggleRow label="Mirror camera"     sub="Flip front camera horizontally" icon="🪞" value={mirrorCam} onChange={v=>handleToggle(setMirrorCam,'Mirror camera',v)}    />
          <Divider/>
          <ToggleRow label="Auto-mute on join" sub="Start every call muted"         icon="🤫" value={autoMute}  onChange={v=>handleToggle(setAutoMute,'Auto-mute',v)}         />
          <Divider/>
          <ActionRow label="Test audio & video" sub="Check mic, camera & speakers" icon="🔬"
            onClick={async () => {
              setTestingAV(true)
              await fakeSave(2000)
              setTestingAV(false)
              toast('Audio & Video working perfectly! 🎉')
            }}
            loading={testingAV}
          />
        </Section>

        {/* ══ ACCOUNT ══ */}
        <Section title="Account" icon="⚙️" accent="violet">
          <ActionRow label="Change password"   sub="Update your account password"    icon="🔑"
            onClick={() => setShowPasswordModal(true)}/>
          <Divider/>
          <ActionRow label="Subscription"      sub="ConnectNow Pro · Renews Apr 2026" icon="💎" badge="Pro"
            onClick={() => toast('Subscription portal opened 💎','info')}/>
          <Divider/>
        
          <ActionRow label="Delete account"    sub="Permanently remove all your data" icon="🗑️" danger
            onClick={() => setShowDeleteModal(true)}/>
        </Section>

        

      </div>

      {/* ══ MODALS ══ */}

      <BlockedUsersModal
        open={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        toast={toast}
      />

      <ConfirmModal
        open={showDeleteModal} onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount} loading={deleteLoading}
        title="Delete Account" danger confirmLabel="Yes, delete forever"
        message="This will permanently delete your account, all chats, friends, and data. This cannot be undone."
      />

      <ConfirmModal
        open={showLogoutModal} onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutAll} loading={logoutLoading}
        title="Sign Out All Devices" confirmLabel="Sign out everywhere"
        message="This will immediately end all active sessions on every device. You'll need to sign in again."
      />

      <Modal open={showSessionModal} onClose={() => setShowSessionModal(false)} title="Active Sessions">
        <div className="flex flex-col gap-2 mb-4">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl"
              style={{ background:s.current?'rgba(20,184,166,0.07)':'rgba(255,255,255,0.03)', border:`1px solid ${s.current?'rgba(20,184,166,0.2)':'rgba(255,255,255,0.07)'}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                {s.device.includes('Mobile') ? '📱' : '💻'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-xs font-semibold truncate">{s.device}</p>
                  {s.current && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
                      style={{ background:'rgba(20,184,166,0.15)', color:'#14b8a6' }}>
                      Current
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-[10px] mt-0.5">{s.location} · {s.time}</p>
              </div>
              {!s.current && (
                <button onClick={() => toast(`Session revoked: ${s.device}`,'info')}
                  className="p-1.5 rounded-lg transition-all hover:scale-110"
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
                  <X size={12} className="text-red-400"/>
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => { setShowSessionModal(false); setShowLogoutModal(true) }}
          className="w-full py-3 rounded-2xl text-sm font-bold text-red-400 transition-all hover:bg-red-500/8"
          style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)' }}>
          Revoke all other sessions
        </button>
      </Modal>

      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <PasswordForm onClose={() => setShowPasswordModal(false)} toast={toast}/>
      </Modal>

    </main>
  )
}
