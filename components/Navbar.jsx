'use client'
import {
  Zap, Bell, Menu, X,
  Home, Compass, Users, Shield,
  LogOut, Settings, User, ChevronDown, Loader2, Heart
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Home',    href: '/',        icon: Home    },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Friends', href: '/friends', icon: Users   },
  { label: 'Safety',  href: '/safety',  icon: Shield  },
  { label: 'Donate',  href: '/donate',  icon: Heart   },
]

const MOCK_USER = {
  name:   'Manik',
  email:  'manik@example.com',
  avatar: null,
}
const MOCK_GEO = {
  flag:    '🇮🇳',
  city:    'Hyderabad',
  country: 'India',
  isp:     'Airtel Broadband',
}

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()

  const [menuOpen,   setMenuOpen]   = useState(false)
  const [dropOpen,   setDropOpen]   = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [notifOpen,  setNotifOpen]  = useState(false)

  useEffect(() => { setMenuOpen(false); setDropOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [menuOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      console.log('Logout triggered')
      router.push('/login')
    } catch (err) {
      console.error(err)
    } finally {
      setLoggingOut(false)
      setDropOpen(false)
    }
  }

  const NOTIFS = [
    { icon:'💬', text:'Alex K. wants to chat',  time:'2m',  color:'#14b8a6', unread:true  },
    { icon:'👥', text:'Yuki T. added you',       time:'15m', color:'#8b5cf6', unread:true  },
    { icon:'⭐', text:'You got a 5-star rating', time:'1h',  color:'#fbbf24', unread:false },
    { icon:'🌍', text:'New friend from Japan',   time:'3h',  color:'#f472b6', unread:false },
  ]
  const unreadCount = NOTIFS.filter(n => n.unread).length

  return (
    <>
      {/* ══════════════════════════════════════
          MAIN NAVBAR
      ══════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between"
        style={{
          background:     'rgba(6,10,20,0.85)',
          backdropFilter: 'blur(24px)',
          borderBottom:   '1px solid rgba(255,255,255,0.06)',
          boxShadow:      '0 4px 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.5),rgba(139,92,246,0.4),transparent)' }} />

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
            style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 16px rgba(20,184,166,0.3)' }}>
            <Zap size={17} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight"
            style={{ background:'linear-gradient(135deg,#14b8a6,#a78bfa,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            ConnectNow
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active   = pathname === href
            const isDonate = label === 'Donate'
            return (
              <Link key={label} href={href}
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? (isDonate ? 'rgba(244,114,182,0.1)' : 'rgba(255,255,255,0.08)') : 'transparent',
                  color:       active ? '#ffffff' : '#9ca3af',
                }}>
                <Icon size={14} style={{ color: active ? (isDonate ? '#f472b6' : '#14b8a6') : undefined }} />
                {label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: isDonate ? '#f472b6' : '#14b8a6' }} />
                )}
              </Link>
            )
          })}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2">

          {/* ── Notification bell ── */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => { setNotifOpen(o => !o); setDropOpen(false) }}
              className="relative p-2 rounded-xl transition-all hover:bg-white/8"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <Bell size={17} className="text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notif dropdown */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-72 z-50 rounded-2xl overflow-hidden"
                  style={{ background:'rgba(8,12,24,0.97)', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(24px)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-white text-sm font-bold">Notifications</p>
                    <button className="text-teal-400 text-[10px] font-semibold hover:text-teal-300">
                      Mark all read
                    </button>
                  </div>
                  {NOTIFS.map((n, i) => (
                    <div key={i}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/4 cursor-pointer relative"
                      style={{ borderBottom: i < NOTIFS.length-1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                      {n.unread && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                          style={{ background:n.color }} />
                      )}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${n.unread?'text-white font-semibold':'text-gray-400'}`}>{n.text}</p>
                        <p className="text-gray-600 text-[10px] mt-0.5">{n.time} ago</p>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <button className="w-full text-center text-xs text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── User avatar + dropdown ── */}
          <div className="relative">
            <button
              onClick={() => { setDropOpen(o => !o); setNotifOpen(false) }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-white/6"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="relative">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center text-xs font-black text-white overflow-hidden">
                  {MOCK_USER.avatar
                    ? <img src={MOCK_USER.avatar} alt="" className="w-full h-full object-cover" />
                    : MOCK_USER.name?.[0]
                  }
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#060A14]" />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-xs font-bold text-white">{MOCK_USER.name}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{MOCK_GEO.flag} {MOCK_GEO.city}</span>
              </div>
              <ChevronDown size={12} className={`text-gray-500 hidden lg:block transition-transform duration-200 ${dropOpen?'rotate-180':''}`} />
            </button>

            {/* ── Dropdown ── */}
            {dropOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                <div
                  className="absolute top-full right-0 mt-2 w-60 z-50 rounded-2xl overflow-hidden flex flex-col"
                  style={{ background:'rgba(8,12,24,0.98)', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(28px)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>

                  <div className="h-px"
                    style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.7),rgba(139,92,246,0.7),transparent)' }} />

                  {/* User info */}
                  <div className="p-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center text-base font-black text-white">
                          {MOCK_USER.name?.[0]}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#060A14]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-black truncate">{MOCK_USER.name}</p>
                        <p className="text-gray-500 text-[10px] truncate">{MOCK_USER.email}</p>
                      </div>
                    </div>
                    {/* Geo card */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl"
                      style={{ background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.15)' }}>
                      <span className="text-base flex-shrink-0">{MOCK_GEO.flag}</span>
                      <div className="min-w-0">
                        <p className="text-white text-[10px] font-semibold truncate">{MOCK_GEO.city}, {MOCK_GEO.country}</p>
                        <p className="text-gray-500 text-[9px] truncate">{MOCK_GEO.isp}</p>
                      </div>
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
                        style={{ background:'rgba(20,184,166,0.12)', color:'#14b8a6', border:'1px solid rgba(20,184,166,0.25)' }}>
                        Live
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 flex flex-col gap-0.5">

                    {/* View Profile */}
                    <Link href="/profile" onClick={() => setDropOpen(false)}>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:bg-white/6 cursor-pointer group">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.2)' }}>
                          <User size={13} className="text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-xs font-semibold">View Profile</p>
                          <p className="text-gray-600 text-[9px]">See your public profile</p>
                        </div>
                        <ChevronDown size={11} className="text-gray-700 -rotate-90 group-hover:text-gray-500" />
                      </div>
                    </Link>

                    {/* Settings */}
                    <Link href="/settings" onClick={() => setDropOpen(false)}>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:bg-white/6 cursor-pointer group">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)' }}>
                          <Settings size={13} className="text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-xs font-semibold">Settings</p>
                          <p className="text-gray-600 text-[9px]">Preferences & privacy</p>
                        </div>
                        <ChevronDown size={11} className="text-gray-700 -rotate-90 group-hover:text-gray-500" />
                      </div>
                    </Link>

                    {/* Donate */}
                    <Link href="/donate" onClick={() => setDropOpen(false)}>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:bg-white/6 cursor-pointer group">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:'rgba(244,114,182,0.1)', border:'1px solid rgba(244,114,182,0.2)' }}>
                          <Heart size={13} className="text-pink-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-xs font-semibold">Support Us</p>
                          <p className="text-gray-600 text-[9px]">Buy the dev a coffee ☕</p>
                        </div>
                        <ChevronDown size={11} className="text-gray-700 -rotate-90 group-hover:text-gray-500" />
                      </div>
                    </Link>

                    {/* Divider */}
                    <div className="h-px mx-2 my-1" style={{ background:'rgba(255,255,255,0.06)' }} />

                    {/* Sign out */}
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:bg-red-500/8 disabled:opacity-60 group">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
                        {loggingOut
                          ? <Loader2 size={13} className="animate-spin text-red-400" />
                          : <LogOut size={13} className="text-red-400" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-red-400 text-xs font-semibold">
                          {loggingOut ? 'Signing out...' : 'Sign Out'}
                        </p>
                        <p className="text-gray-600 text-[9px]">End your session</p>
                      </div>
                    </button>
                  </div>

                  <div className="h-px"
                    style={{ background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent)' }} />
                </div>
              </>
            )}
          </div>

          {/* ── Start Chat CTA — desktop ── */}
          <Link href="/" className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 16px rgba(20,184,166,0.25)' }}>
            <Zap size={13} />
            Start Chat
          </Link>

          {/* ── Hamburger — mobile ── */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-xl transition-all hover:bg-white/10"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
            {menuOpen
              ? <X    size={19} className="text-white"    />
              : <Menu size={19} className="text-gray-300" />}
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          MOBILE DRAWER OVERLAY
      ══════════════════════════════════════ */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden"
          style={{ backdropFilter:'blur(6px)' }}
          onClick={() => setMenuOpen(false)} />
      )}

      {/* ══════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════ */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col transition-transform duration-300 ease-in-out ${menuOpen?'translate-x-0':'translate-x-full'}`}
        style={{ background:'rgba(6,10,20,0.98)', backdropFilter:'blur(28px)', borderLeft:'1px solid rgba(255,255,255,0.07)' }}>

        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.6),rgba(139,92,246,0.6),transparent)' }} />

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)' }}>
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-base font-black"
              style={{ background:'linear-gradient(135deg,#14b8a6,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              ConnectNow
            </span>
          </div>
          <button onClick={() => setMenuOpen(false)}
            className="p-1.5 rounded-xl transition-all hover:bg-white/10"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <X size={17} className="text-gray-400" />
          </button>
        </div>

        {/* Drawer user card */}
        <div className="mx-4 mt-4 p-4 rounded-2xl"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center text-xl font-black text-white">
                {MOCK_USER.name?.[0]}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#060A14]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm">{MOCK_USER.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                <p className="text-green-400 text-[10px] font-semibold">Online</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="p-2 rounded-xl transition-all hover:bg-white/10"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <Bell size={15} className="text-gray-400" />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                  style={{ background:'#14b8a6' }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-base">{MOCK_GEO.flag}</span>
            <div className="min-w-0 flex-1">
              <p className="text-white text-[10px] font-semibold truncate">{MOCK_GEO.city}, {MOCK_GEO.country}</p>
              <p className="text-gray-600 text-[9px] truncate">{MOCK_GEO.isp}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
              style={{ background:'rgba(20,184,166,0.12)', color:'#14b8a6', border:'1px solid rgba(20,184,166,0.25)' }}>
              Live
            </span>
          </div>
        </div>

        {/* Drawer nav links */}
        <div className="flex flex-col gap-0.5 px-3 mt-4 flex-1 overflow-y-auto">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold px-3 mb-1">Navigation</p>
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active   = pathname === href
            const isDonate = label === 'Donate'
            const activeBg     = isDonate ? 'rgba(244,114,182,0.1)'  : 'rgba(20,184,166,0.1)'
            const activeBorder = isDonate ? 'rgba(244,114,182,0.2)'  : 'rgba(20,184,166,0.2)'
            const activeColor  = isDonate ? '#f472b6' : '#14b8a6'
            return (
              <Link key={label} href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? activeBg        : 'transparent',
                  color:       active ? '#ffffff'       : '#9ca3af',
                  border:      active ? `1px solid ${activeBorder}` : '1px solid transparent',
                }}>
                <Icon size={16} style={{ color: active ? activeColor : '#6b7280' }} />
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: activeColor }} />}
              </Link>
            )
          })}

          {/* Account section */}
          <div className="mt-3 pt-3 flex flex-col gap-0.5" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold px-3 mb-1">Account</p>

            {/* View Profile */}
            <Link href="/profile" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/5 cursor-pointer"
                style={{
                  color:       pathname==='/profile' ? '#ffffff' : '#9ca3af',
                  background:  pathname==='/profile' ? 'rgba(20,184,166,0.08)' : 'transparent',
                  border:      pathname==='/profile' ? '1px solid rgba(20,184,166,0.2)' : '1px solid transparent',
                }}>
                <User size={16} style={{ color: pathname==='/profile' ? '#14b8a6' : '#6b7280' }} />
                View Profile
                {pathname==='/profile' && <span className="ml-auto w-1.5 h-1.5 bg-teal-400 rounded-full" />}
              </div>
            </Link>

            {/* Settings */}
            <Link href="/settings" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/5 cursor-pointer"
                style={{
                  color:       pathname==='/settings' ? '#ffffff' : '#9ca3af',
                  background:  pathname==='/settings' ? 'rgba(139,92,246,0.08)' : 'transparent',
                  border:      pathname==='/settings' ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                }}>
                <Settings size={16} style={{ color: pathname==='/settings' ? '#8b5cf6' : '#6b7280' }} />
                Settings
                {pathname==='/settings' && <span className="ml-auto w-1.5 h-1.5 bg-violet-400 rounded-full" />}
              </div>
            </Link>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-red-500/8 disabled:opacity-60"
              style={{ color:'#f87171' }}>
              {loggingOut
                ? <Loader2 size={16} className="animate-spin" />
                : <LogOut size={16} className="text-red-400" />}
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Drawer CTA */}
        <div className="px-4 pb-8 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" onClick={() => setMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background:'linear-gradient(135deg,#14b8a6,#8b5cf6)', boxShadow:'0 0 20px rgba(20,184,166,0.25)' }}>
            <Zap size={14} />
            Start Chatting Now
          </Link>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <p className="text-center text-[10px] text-gray-600">2.4M users online right now</p>
          </div>
        </div>
      </div>
    </>
  )
}
