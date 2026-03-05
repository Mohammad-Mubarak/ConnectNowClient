// 'use client'
// import { Camera, CameraOff, Mic, MicOff, Maximize2, Users, Radio, Waves } from 'lucide-react'

// export default function VideoCard({ label, isSearching = false, isYou = false, mode = 'video' }) {
//   const isAudio = mode === 'audio'

//   return (
//     <div className={`relative rounded-2xl overflow-hidden flex-1 glass border transition-all duration-500 ${
//       isAudio
//         ? isYou
//           ? 'border-teal-500/30 min-h-[340px]'
//           : 'border-violet-500/30 min-h-[340px]'
//         : isYou
//           ? 'border-teal-500/30 glow-teal min-h-[340px]'
//           : 'border-violet-500/30 glow-purple min-h-[340px]'
//     }`}>

//       {/* ─────────── AUDIO MODE ─────────── */}
//       {isAudio ? (
//         <div className={`absolute inset-0 flex flex-col items-center justify-center gap-6 ${
//           isYou
//             ? 'bg-gradient-to-br from-[#0a1a1a] to-[#0d1f2d]'
//             : 'bg-gradient-to-br from-[#0f0a1e] to-[#150d2a]'
//         }`}>

//           {/* Ambient background glow */}
//           <div className={`absolute inset-0 opacity-20 ${
//             isYou
//               ? 'bg-[radial-gradient(ellipse_at_center,_#14b8a6_0%,_transparent_70%)]'
//               : 'bg-[radial-gradient(ellipse_at_center,_#8b5cf6_0%,_transparent_70%)]'
//           }`} />

//           {isSearching && !isYou ? (
//             /* ── Searching for voice partner ── */
//             <div className="relative flex flex-col items-center gap-5 z-10">
//               {/* Ripple rings */}
//               <div className="relative flex items-center justify-center">
//                 {[1, 2, 3].map((i) => (
//                   <div
//                     key={i}
//                     className={`absolute rounded-full border ${
//                       isYou ? 'border-teal-400/30' : 'border-violet-400/30'
//                     }`}
//                     style={{
//                       width: `${60 + i * 40}px`,
//                       height: `${60 + i * 40}px`,
//                       animation: `ripple 2s ease-out infinite`,
//                       animationDelay: `${i * 0.4}s`,
//                     }}
//                   />
//                 ))}

//                 {/* Center circle */}
//                 <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
//                   isYou
//                     ? 'bg-teal-500/10 border-teal-400/50'
//                     : 'bg-violet-500/10 border-violet-400/50'
//                 }`}>
//                   <Radio size={28} className={isYou ? 'text-teal-400' : 'text-violet-400'} />
//                 </div>
//               </div>

//               <div className="text-center">
//                 <p className={`text-sm font-semibold ${isYou ? 'text-teal-300' : 'text-violet-300'}`}>
//                   Finding voice partner
//                 </p>
//                 <div className="flex justify-center gap-1 mt-1.5">
//                   <span className="dot-1 w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
//                   <span className="dot-2 w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
//                   <span className="dot-3 w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             /* ── Connected / You audio UI ── */
//             <div className="relative flex flex-col items-center gap-5 z-10">
//               {/* Sound wave rings — animate when speaking */}
//               <div className="relative flex items-center justify-center">
//                 {[1, 2, 3].map((i) => (
//                   <div
//                     key={i}
//                     className={`absolute rounded-full ${
//                       isYou ? 'bg-teal-400/5 border border-teal-400/20' : 'bg-violet-400/5 border border-violet-400/20'
//                     }`}
//                     style={{
//                       width: `${72 + i * 36}px`,
//                       height: `${72 + i * 36}px`,
//                       animation: `pulse-ring ${1.2 + i * 0.3}s ease-in-out infinite`,
//                       animationDelay: `${i * 0.2}s`,
//                     }}
//                   />
//                 ))}

//                 {/* Avatar Circle */}
//                 <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-2 z-10 ${
//                   isYou
//                     ? 'bg-gradient-to-br from-teal-500/30 to-teal-700/20 border-teal-400/60'
//                     : 'bg-gradient-to-br from-violet-500/30 to-violet-700/20 border-violet-400/60'
//                 }`}>
//                   {isYou ? '👤' : '?'}
//                 </div>
//               </div>

//               {/* Sound wave bars */}
//               <div className="flex items-end gap-1 h-8">
//                 {[3, 6, 9, 12, 9, 6, 3, 6, 9, 6, 3].map((h, i) => (
//                   <div
//                     key={i}
//                     className={`w-1 rounded-full ${isYou ? 'bg-teal-400' : 'bg-violet-400'}`}
//                     style={{
//                       height: `${h}px`,
//                       animation: `wave-bar 1s ease-in-out infinite`,
//                       animationDelay: `${i * 0.08}s`,
//                       opacity: isYou ? 0.7 : 0.5,
//                     }}
//                   />
//                 ))}
//               </div>

//               <p className={`text-xs font-medium ${isYou ? 'text-teal-300' : 'text-violet-300'}`}>
//                 {isYou ? 'Your Mic' : 'Stranger'}
//               </p>
//             </div>
//           )}

//           {/* Mode badge */}
//           <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold glass border ${
//             isYou ? 'border-teal-500/30 text-teal-300' : 'border-violet-500/30 text-violet-300'
//           }`}>
//             <Mic size={10} />
//             {label} · Audio
//           </div>

//           {/* Status dot */}
//           <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
//             <div className="flex items-center gap-1.5">
//               <div className={`w-2 h-2 rounded-full animate-pulse ${
//                 isYou ? 'bg-teal-400' : isSearching ? 'bg-violet-400' : 'bg-green-400'
//               }`} />
//               <span className="text-xs text-gray-400">
//                 {isYou ? 'Mic Live' : isSearching ? 'Searching...' : 'Connected'}
//               </span>
//             </div>
//             {isYou && (
//               <div className="flex items-center gap-1.5">
//                 <div className="p-1 glass rounded-lg border border-white/10">
//                   <Waves size={12} className="text-teal-400" />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//       ) : (
//         /* ─────────── VIDEO MODE (original) ─────────── */
//         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
//           {isYou ? (
//             <div className="flex flex-col items-center gap-3">
//               <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/30 to-teal-600/20 border border-teal-500/40 flex items-center justify-center">
//                 <Camera size={32} className="text-teal-400" />
//               </div>
//               <p className="text-gray-400 text-sm">Camera preview</p>
//             </div>
//           ) : isSearching ? (
//             <div className="flex flex-col items-center gap-4">
//               <div className="relative">
//                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 flex items-center justify-center pulse-ring">
//                   <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
//                     <Users size={24} className="text-violet-400" />
//                   </div>
//                 </div>
//                 <div
//                   className="absolute inset-0 rounded-full border border-violet-400/20 animate-spin"
//                   style={{ animationDuration: '3s' }}
//                 >
//                   <div className="absolute -top-1 left-1/2 w-2 h-2 bg-violet-400 rounded-full -translate-x-1/2" />
//                 </div>
//               </div>
//               <div className="text-center">
//                 <p className="text-violet-300 text-sm font-medium">Finding a stranger</p>
//                 <div className="flex justify-center gap-1 mt-1">
//                   <span className="dot-1 w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
//                   <span className="dot-2 w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
//                   <span className="dot-3 w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center gap-3">
//               <div className="w-20 h-20 rounded-full bg-gray-700/50 border border-gray-600/30 flex items-center justify-center">
//                 <CameraOff size={32} className="text-gray-500" />
//               </div>
//               <p className="text-gray-500 text-sm">Waiting to connect...</p>
//             </div>
//           )}

//           {/* Label badge */}
//           <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold glass border ${
//             isYou ? 'border-teal-500/30 text-teal-300' : 'border-violet-500/30 text-violet-300'
//           }`}>
//             {label}
//           </div>

//           {/* Fullscreen btn */}
//           <button className="absolute top-3 right-3 p-1.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-all">
//             <Maximize2 size={14} className="text-gray-400" />
//           </button>

//           {/* Bottom status bar */}
//           <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
//             <div className="flex items-center gap-1.5">
//               <div className={`w-2 h-2 rounded-full ${isYou ? 'bg-teal-400' : 'bg-violet-400'} animate-pulse`} />
//               <span className="text-xs text-gray-400">
//                 {isYou ? 'Live' : isSearching ? 'Searching...' : 'Offline'}
//               </span>
//             </div>
//             {isYou && (
//               <div className="flex items-center gap-1.5">
//                 <div className="p-1 glass rounded-lg border border-white/10">
//                   <Mic size={12} className="text-green-400" />
//                 </div>
//                 <div className="p-1 glass rounded-lg border border-white/10">
//                   <Camera size={12} className="text-teal-400" />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }



'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Camera, CameraOff, Mic, MicOff,
  Maximize2, Users, Radio, Waves, Signal
} from 'lucide-react'

// ── Waveform ──────────────────────────────────────────────────────────────────
function LiveWaveform({ stream, color = '#2dd4bf', barCount = 28 }) {
  const [bars, setBars] = useState(new Array(barCount).fill(2))
  const animRef         = useRef(null)

  useEffect(() => {
    if (!stream) { setBars(new Array(barCount).fill(2)); return }
    const ctx      = new (window.AudioContext || window.webkitAudioContext)()
    const source   = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize               = 512
    analyser.smoothingTimeConstant = 0.85
    source.connect(analyser) // ✅ NEVER to destination

    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((s, v) => s + v, 0) / data.length

      if (avg < 5) {
        const t    = Date.now() / 800
        const idle = Array.from({ length: barCount }, (_, i) => {
          const c    = (barCount - 1) / 2
          const dist = Math.abs(i - c) / c
          return Math.max(2, Math.round(3 + Math.sin(t + i * 0.4) * 2 * (1 - dist)))
        })
        setBars(idle)
      } else {
        const step = Math.floor(data.length / barCount)
        setBars(Array.from({ length: barCount }, (_, i) => {
          const c    = (barCount - 1) / 2
          const dist = Math.abs(i - c) / c
          const val  = data[i * step] || 0
          const h    = Math.max(2, Math.round((val / 255) * 56))
          return Math.max(2, Math.round(h * (1 - dist * 0.22)))
        }))
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animRef.current)
      try { source.disconnect() } catch (_) {}
      ctx.close()
    }
  }, [stream, barCount])

  return (
    <div className="flex items-center justify-center gap-[2.5px]"
      style={{ height: '60px', width: '100%' }}
    >
      {bars.map((h, i) => {
        const c       = (barCount - 1) / 2
        const dist    = Math.abs(i - c) / c
        const opacity = 0.25 + (1 - dist) * 0.75
        return (
          <div key={i}
            style={{
              height:       `${h}px`,
              width:        '3px',
              borderRadius: '999px',
              background:   color,
              opacity,
              transition:   'height 55ms ease, opacity 55ms ease',
              boxShadow:    h > 20 ? `0 0 6px ${color}cc` : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

// ── Ripple Rings ──────────────────────────────────────────────────────────────
function RippleRings({ color, active, count = 4, base = 92 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width:                   `${base + i * 36}px`,
            height:                  `${base + i * 36}px`,
            top:                     '50%',
            left:                    '50%',
            transform:               'translate(-50%,-50%)',
            border:                  `1px solid ${color}`,
            opacity:                 active ? (0.22 - i * 0.04) : (0.06 - i * 0.01),
            animationName:           'pulse-ring',
            animationDuration:       `${active ? 2 + i * 0.5 : 3 + i * 0.8}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay:          `${i * 0.35}s`,
          }}
        />
      ))}
    </>
  )
}

// ── VideoCard ─────────────────────────────────────────────────────────────────
export default function VideoCard({
  label,
  stream      = null,
  isSearching = false,
  isYou       = false,
  mode        = 'video',
  isMuted     = false,
  isCamOff    = false,
}) {
  const videoRef = useRef(null)
  const isAudio  = mode === 'audio'
  const teal     = '#2dd4bf'
  const violet   = '#a78bfa'
  const color    = isYou ? teal : violet

  // ✅ PDF fix: local muted+vol=0, stranger vol=0.9
  useEffect(() => {
    if (!videoRef.current || !stream) return
    videoRef.current.srcObject = stream
    videoRef.current.muted     = isYou
    videoRef.current.volume    = isYou ? 0 : 0.9
  }, [stream, isYou])

  return (
    <div
      className="relative rounded-3xl overflow-hidden flex-1 min-h-[420px]"
      style={{
        background: isYou
          ? 'linear-gradient(160deg,#040d0d 0%,#061414 50%,#081c1c 100%)'
          : 'linear-gradient(160deg,#060408 0%,#0c0618 50%,#120825 100%)',
        border:    `1px solid ${color}18`,
        boxShadow: `0 0 0 1px ${color}0a,0 20px 60px rgba(0,0,0,0.6),inset 0 1px 0 ${color}15`,
      }}
    >
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize:  '128px',
        }}
      />

      {/* Top edge glow */}
      <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,${color}60,transparent)` }}
      />

      {/* Ambient glow */}
      <div className="absolute pointer-events-none"
        style={{
          top:        '30%',
          left:       '50%',
          transform:  'translate(-50%,-50%)',
          width:      '280px',
          height:     '280px',
          background: `radial-gradient(circle,${color}0e 0%,transparent 70%)`,
        }}
      />

      {/* ════════ AUDIO MODE ════════ */}
      {isAudio && (
        <div className="absolute inset-0 flex flex-col items-center justify-between px-5 py-5">

          {/* Top bar */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background:     `${color}0f`,
                border:         `1px solid ${color}28`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {isMuted
                ? <MicOff size={11} className="text-red-400" />
                : <Mic    size={11} style={{ color }} />}
              <span className="text-xs font-semibold tracking-wide" style={{ color }}>
                {label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: `${color}0a`, border: `1px solid ${color}20` }}
            >
              <div className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:              isYou ? teal : isSearching ? '#fbbf24' : stream ? '#34d399' : '#4b5563',
                  animationName:           'pulse',
                  animationDuration:       '2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }}
              />
              <span className="text-[10px] font-mono font-medium"
                style={{ color: `${color}80` }}
              >
                {isYou ? (isMuted ? 'MUTED' : 'LIVE') : isSearching ? 'SCAN...' : stream ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>
          </div>

          {/* Center */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
            {isSearching && !isYou ? (

              /* Searching */
              <div className="flex flex-col items-center gap-8">
                <div className="relative flex items-center justify-center"
                  style={{ width: '180px', height: '180px' }}
                >
                  {[1,2,3,4,5].map(i => (
                    <div key={i}
                      className="absolute rounded-full"
                      style={{
                        width:                   `${36 + i * 28}px`,
                        height:                  `${36 + i * 28}px`,
                        top:                     '50%',
                        left:                    '50%',
                        transform:               'translate(-50%,-50%)',
                        border:                  `1px solid ${violet}`,
                        opacity:                 0.06 + (5 - i) * 0.06,
                        animationName:           'ripple',
                        animationDuration:       '3.5s',
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay:          `${i * 0.55}s`,
                      }}
                    />
                  ))}
                  <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(135deg,${violet}20,${violet}05)`,
                      border:     `1.5px solid ${violet}45`,
                      boxShadow:  `0 0 30px ${violet}20,inset 0 0 20px ${violet}08`,
                    }}
                  >
                    <Radio size={22} style={{ color: violet }} />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-bold tracking-[0.35em] uppercase"
                    style={{ color: `${violet}cc` }}
                  >
                    Finding Partner
                  </p>
                  <div className="relative w-32 h-0.5 rounded-full overflow-hidden"
                    style={{ background: `${violet}15` }}
                  >
                    <div className="absolute top-0 left-0 h-full w-12 rounded-full"
                      style={{
                        background:              `linear-gradient(90deg,transparent,${violet},transparent)`,
                        animationName:           'scan-line',
                        animationDuration:       '1.8s',
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                      }}
                    />
                  </div>
                </div>
              </div>

            ) : (

              /* Connected / Idle */
              <div className="flex flex-col items-center w-full">

                {/* Avatar with rings */}
                <div className="relative flex items-center justify-center mb-6"
                  style={{ width: '190px', height: '190px' }}
                >
                  <RippleRings color={color} active={!!stream && !isMuted} count={4} base={88} />
                  <div className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: isYou
                        ? 'radial-gradient(135deg,#0f3535 0%,#061818 100%)'
                        : 'radial-gradient(135deg,#1e0a40 0%,#0a0520 100%)',
                      border:    `2px solid ${color}40`,
                      boxShadow: `0 0 0 1px ${color}15,0 0 40px ${color}20,inset 0 1px 0 ${color}20`,
                    }}
                  >
                    <span style={{ fontSize: 38, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
                      {isYou ? '🎙️' : stream ? '🎭' : '❓'}
                    </span>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full"
                      style={{
                        background: isYou ? teal : stream ? '#34d399' : '#374151',
                        border:     `2.5px solid ${isYou ? '#061818' : '#0a0520'}`,
                        boxShadow:  `0 0 10px ${isYou ? teal : stream ? '#34d399' : 'transparent'}80`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-sm font-bold tracking-wide mb-1" style={{ color }}>
                  {isYou ? 'You' : stream ? 'Stranger' : 'Waiting...'}
                </p>
                <p className="text-[11px] font-mono mb-7" style={{ color: `${color}50` }}>
                  {isYou
                    ? isMuted ? '[ mic disabled ]' : '[ 48kHz · mono · live ]'
                    : stream  ? '[ peer connected ]'
                    :           '[ awaiting peer ]'}
                </p>

                {/* ✅ Free floating waveform — no box */}
                <LiveWaveform stream={stream} color={color} barCount={28} />
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Signal size={11} style={{ color: `${color}50` }} />
              <span className="text-[10px] font-mono" style={{ color: `${color}45` }}>
                {isYou ? 'opus · 48k · ec:on' : stream ? 'p2p · webrtc' : 'standby'}
              </span>
            </div>
            {isYou && !isMuted && (
              <div className="flex items-center gap-1.5">
                <Waves size={10} style={{ color: `${color}60` }} />
                <span className="text-[10px] font-mono" style={{ color: `${color}45` }}>
                  aec active
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ VIDEO MODE ════════ */}
      {!isAudio && (
        <div className="absolute inset-0">

          {stream && !isCamOff && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {stream && !isCamOff && (
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg,
                  rgba(0,0,0,0.45) 0%,
                  transparent 30%,
                  transparent 65%,
                  rgba(0,0,0,0.7) 100%)`,
              }}
            />
          )}

          {/* No stream overlays */}
          {(!stream || isCamOff) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              {isYou ? (
                <>
                  <div className="relative flex items-center justify-center"
                    style={{ width: 140, height: 140 }}
                  >
                    <RippleRings color={teal} active={!isCamOff} count={3} base={76} />
                    <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(135deg,#0f3535,#061818)',
                        border:     `2px solid ${teal}35`,
                        boxShadow:  `0 0 30px ${teal}18`,
                      }}
                    >
                      {isCamOff
                        ? <CameraOff size={30} className="text-red-400" />
                        : <Camera    size={30} style={{ color: teal }} />}
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: `${teal}80` }}>
                    {isCamOff ? 'Camera disabled' : 'Starting camera...'}
                  </p>
                </>

              ) : isSearching ? (
                <>
                  <div className="relative flex items-center justify-center"
                    style={{ width: 160, height: 160 }}
                  >
                    {[1,2,3,4].map(i => (
                      <div key={i}
                        className="absolute rounded-full"
                        style={{
                          width:                   `${44 + i * 28}px`,
                          height:                  `${44 + i * 28}px`,
                          top:                     '50%',
                          left:                    '50%',
                          transform:               'translate(-50%,-50%)',
                          border:                  `1px solid ${violet}`,
                          opacity:                 0.05 + (4 - i) * 0.07,
                          animationName:           'ripple',
                          animationDuration:       '3s',
                          animationTimingFunction: 'ease-out',
                          animationIterationCount: 'infinite',
                          animationDelay:          `${i * 0.5}s`,
                        }}
                      />
                    ))}
                    <div className="relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(135deg,${violet}18,${violet}05)`,
                        border:     `2px solid ${violet}40`,
                        boxShadow:  `0 0 28px ${violet}20`,
                      }}
                    >
                      <Users size={26} style={{ color: violet }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs font-bold tracking-[0.3em] uppercase"
                      style={{ color: `${violet}cc` }}
                    >
                      Finding Stranger
                    </p>
                    <div className="relative w-28 h-0.5 rounded-full overflow-hidden"
                      style={{ background: `${violet}18` }}
                    >
                      <div className="absolute top-0 left-0 h-full w-10 rounded-full"
                        style={{
                          background:              `linear-gradient(90deg,transparent,${violet},transparent)`,
                          animationName:           'scan-line',
                          animationDuration:       '1.8s',
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                        }}
                      />
                    </div>
                  </div>
                </>

              ) : (
                <>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border:     '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <CameraOff size={28} className="text-gray-700" />
                  </div>
                  <p className="text-xs text-gray-700 font-medium tracking-wide">
                    Waiting to connect
                  </p>
                </>
              )}
            </div>
          )}

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background:     'rgba(0,0,0,0.55)',
                border:         `1px solid ${color}30`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:              isYou ? teal : stream ? '#34d399' : violet,
                  animationName:           'pulse',
                  animationDuration:       '2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }}
              />
              <span className="text-xs font-semibold" style={{ color }}>
                {label}
              </span>
            </div>

            <button
              onClick={() => videoRef.current?.requestFullscreen?.()}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background:     'rgba(0,0,0,0.5)',
                border:         '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Maximize2 size={13} className="text-gray-300" />
            </button>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-4 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background:     'rgba(0,0,0,0.55)',
                border:         '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:              isYou ? teal : stream ? '#34d399' : '#4b5563',
                  animationName:           'pulse',
                  animationDuration:       '2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }}
              />
              <span className="text-[11px] text-gray-300 font-medium">
                {isYou
                  ? isCamOff ? 'Camera off' : 'Live'
                  : isSearching ? 'Searching...'
                  : stream ? 'Connected' : 'Waiting...'}
              </span>
            </div>

            {isYou && (
              <div className="flex items-center gap-1.5">
                {[
                  {
                    icon: isMuted
                      ? <MicOff  size={12} className="text-red-400" />
                      : <Mic     size={12} className="text-emerald-400" />,
                  },
                  {
                    icon: isCamOff
                      ? <CameraOff size={12} className="text-red-400" />
                      : <Camera    size={12} style={{ color: teal }} />,
                  },
                ].map((item, i) => (
                  <div key={i} className="p-1.5 rounded-full"
                    style={{
                      background:     'rgba(0,0,0,0.55)',
                      border:         '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {item.icon}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
