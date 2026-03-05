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
  Maximize2, Users, Radio, Waves
} from 'lucide-react'

// ── LiveWaveform ──────────────────────────────────────────────────────────────
function LiveWaveform({ stream, color = '#2dd4bf', barCount = 14 }) {
  const [bars, setBars] = useState(new Array(barCount).fill(3))
  const animRef         = useRef(null)

  useEffect(() => {
    if (!stream) {
      setBars(new Array(barCount).fill(3))
      return
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const source   = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize               = 128
    analyser.smoothingTimeConstant = 0.75

    // ✅ ONLY connect to analyser — NEVER to destination (causes echo)
    source.connect(analyser)

    const data      = new Uint8Array(analyser.frequencyBinCount)
    const THRESHOLD = 8

    const tick = () => {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((s, v) => s + v, 0) / data.length
      if (avg < THRESHOLD) {
        setBars(new Array(barCount).fill(3))
      } else {
        const step = Math.floor(data.length / barCount)
        setBars(
          Array.from({ length: barCount }, (_, i) => {
            const center = barCount / 2
            const dist   = Math.abs(i - center) / center
            const val    = data[i * step] || 0
            const h      = Math.max(3, Math.round((val / 255) * 40))
            return Math.max(3, Math.round(h * (1 - dist * 0.25)))
          })
        )
      }
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
      try { source.disconnect() } catch (_) {}
      audioCtx.close()
    }
  }, [stream, barCount])

  return (
    <div className="flex items-end justify-center gap-[3px] h-10 w-full px-4">
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-75"
          style={{
            height:          `${h}px`,
            width:           '5px',
            backgroundColor: color,
            opacity:         0.5 + (h / 40) * 0.5,
          }}
        />
      ))}
    </div>
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

  // ── VIDEO MODE: attach stream to <video> element
  // For stranger: muted=false so their audio plays through <video>
  // For you:      muted=true  so you don't hear yourself
  // ✅ NO separate <audio> element needed — <video> handles audio in video mode
  useEffect(() => {
    if (!videoRef.current || !stream) return
    videoRef.current.srcObject = stream
  }, [stream])

  // ── AUDIO MODE: audio is handled by useWebRTC's persistent
  // document.body <audio> element. We do NOT create any <audio>
  // element here — that was causing double playback = echo
  // ✅ Nothing needed here for audio mode

  return (
    <div className={`
      relative rounded-2xl overflow-hidden flex-1 glass border
      transition-all duration-500 min-h-[360px]
      ${isAudio
        ? isYou ? 'border-teal-500/30' : 'border-violet-500/30'
        : isYou ? 'border-teal-500/30 glow-teal' : 'border-violet-500/30 glow-purple'
      }
    `}>

      {/* ══════════════ AUDIO MODE ══════════════ */}
      {isAudio && (
        <div className={`
          absolute inset-0 flex flex-col items-center justify-center gap-6
          ${isYou
            ? 'bg-gradient-to-br from-[#071a1a] via-[#0a2020] to-[#0d2535]'
            : 'bg-gradient-to-br from-[#0d0718] via-[#130a28] to-[#1a0d35]'}
        `}>

          {/* Radial glow */}
          <div className={`absolute inset-0 opacity-25 ${
            isYou
              ? 'bg-[radial-gradient(ellipse_at_center,_#0d9488_0%,_transparent_65%)]'
              : 'bg-[radial-gradient(ellipse_at_center,_#7c3aed_0%,_transparent_65%)]'
          }`} />

          {/* ── Searching state (stranger only) */}
          {isSearching && !isYou ? (
            <div className="relative flex flex-col items-center gap-6 z-10">
              {[1, 2, 3].map(i => (
                <div key={i}
                  className="absolute rounded-full border border-violet-400/25"
                  style={{
                    width:          `${80 + i * 48}px`,
                    height:         `${80 + i * 48}px`,
                    top: '50%', left: '50%',
                    transform:      'translate(-50%,-50%)',
                    animation:      'ripple 2.4s ease-out infinite',
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
              <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 bg-violet-500/10 border-violet-400/50 z-10">
                <Radio size={32} className="text-violet-400" />
              </div>
              <div className="text-center mt-16">
                <p className="text-sm font-semibold text-violet-300 tracking-wide">
                  Finding voice partner
                </p>
                <div className="flex justify-center gap-1.5 mt-2">
                  {[0, 1, 2].map(i => (
                    <span key={i}
                      className="w-2 h-2 bg-violet-400 rounded-full inline-block"
                      style={{ animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

          ) : (
            /* ── Connected / live state */
            <div className="relative flex flex-col items-center gap-4 z-10 w-full">

              {/* Pulse rings */}
              <div className="relative flex items-center justify-center mb-1">
                {[1, 2, 3].map(i => (
                  <div key={i}
                    className={`absolute rounded-full ${
                      isYou
                        ? 'border border-teal-400/20 bg-teal-400/[0.03]'
                        : 'border border-violet-400/20 bg-violet-400/[0.03]'
                    }`}
                    style={{
                      width:          `${100 + i * 44}px`,
                      height:         `${100 + i * 44}px`,
                      animation:      `pulse-ring ${1.4 + i * 0.35}s ease-in-out infinite`,
                      animationDelay: `${i * 0.25}s`,
                    }}
                  />
                ))}

                {/* Avatar */}
                <div className={`
                  relative z-10 w-24 h-24 rounded-full flex items-center
                  justify-center text-4xl border-2
                  ${isYou
                    ? 'bg-gradient-to-br from-teal-500/30 to-teal-700/20 border-teal-400/60'
                    : 'bg-gradient-to-br from-violet-500/30 to-violet-700/20 border-violet-400/60'}
                `}>
                  {isYou ? '👤' : stream ? '🎭' : '❓'}

                  {/* Online dot */}
                  <div className={`
                    absolute bottom-1 right-1 w-4 h-4 rounded-full border-2
                    ${isYou ? 'border-[#071a1a]' : 'border-[#0d0718]'}
                    ${isYou ? 'bg-teal-400' : stream ? 'bg-green-400' : 'bg-gray-500'}
                  `} />
                </div>
              </div>

              {/* Name */}
              <p className={`text-sm font-semibold tracking-wide ${
                isYou ? 'text-teal-300' : 'text-violet-300'
              }`}>
                {isYou ? 'You' : stream ? 'Stranger' : 'Waiting...'}
              </p>

              {/* ✅ Waveform — only reacts when speaking */}
              <LiveWaveform
                stream={stream}
                color={isYou ? '#2dd4bf' : '#8b5cf6'}
                barCount={14}
              />
            </div>
          )}

          {/* Top label badge */}
          <div className={`
            absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5
            rounded-xl text-xs font-semibold glass border
            ${isYou
              ? 'border-teal-500/40 text-teal-300'
              : 'border-violet-500/40 text-violet-300'}
          `}>
            {isMuted
              ? <MicOff size={11} className="text-red-400" />
              : <Mic    size={11} />}
            {label} · Audio
          </div>

          {/* Bottom status */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                isYou
                  ? 'bg-teal-400 animate-pulse'
                  : isSearching
                    ? 'bg-yellow-400 animate-ping'
                    : stream
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-gray-500'
              }`} />
              <span className="text-xs text-gray-400 font-medium">
                {isYou
                  ? isMuted ? 'Muted' : 'Mic Live'
                  : isSearching
                    ? 'Searching...'
                    : stream ? 'Connected' : 'Waiting...'}
              </span>
            </div>
            {isYou && (
              <div className="p-1.5 glass rounded-lg border border-white/10">
                <Waves size={12} className="text-teal-400" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ VIDEO MODE ══════════════ */}
      {!isAudio && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">

          {/* ✅ Video element handles BOTH video and audio for stranger
              muted={isYou} ensures:
              - Your preview: silent (no echo)
              - Stranger:     audio plays through this <video> tag
              NO separate <audio> needed in video mode */}
          {stream && !isCamOff && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isYou}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Overlays when no stream */}
          {(!stream || isCamOff) && (
            isYou ? (
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/30 to-teal-600/20 border border-teal-500/40 flex items-center justify-center">
                  {isCamOff
                    ? <CameraOff size={36} className="text-red-400" />
                    : <Camera    size={36} className="text-teal-400" />}
                </div>
                <p className="text-gray-400 text-sm">
                  {isCamOff ? 'Camera off' : 'Starting camera...'}
                </p>
              </div>
            ) : isSearching ? (
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Users size={28} className="text-violet-400" />
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 rounded-full border border-violet-400/25 animate-spin"
                    style={{ animationDuration: '3s' }}
                  >
                    <div className="absolute -top-1 left-1/2 w-2.5 h-2.5 bg-violet-400 rounded-full -translate-x-1/2" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-violet-300 text-sm font-medium">Finding a stranger</p>
                  <div className="flex justify-center gap-1.5 mt-1.5">
                    {[0, 1, 2].map(i => (
                      <span key={i}
                        className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block"
                        style={{ animation: 'bounce 1s infinite', animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-24 h-24 rounded-full bg-gray-700/50 border border-gray-600/30 flex items-center justify-center">
                  <CameraOff size={36} className="text-gray-500" />
                </div>
                <p className="text-gray-500 text-sm">Waiting to connect...</p>
              </div>
            )
          )}

          {/* Label badge */}
          <div className={`
            absolute top-3 left-3 px-3 py-1.5 rounded-xl
            text-xs font-semibold glass border z-20
            ${isYou
              ? 'border-teal-500/30 text-teal-300'
              : 'border-violet-500/30 text-violet-300'}
          `}>
            {label}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            className="absolute top-3 right-3 p-1.5 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all z-20"
          >
            <Maximize2 size={14} className="text-gray-400" />
          </button>

          {/* Bottom status bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isYou ? 'bg-teal-400' : stream ? 'bg-green-400' : 'bg-violet-400'
              } animate-pulse`} />
              <span className="text-xs text-gray-400">
                {isYou
                  ? isCamOff ? 'Cam off' : 'Live'
                  : isSearching
                    ? 'Searching...'
                    : stream ? 'Connected' : 'Waiting...'}
              </span>
            </div>
            {isYou && (
              <div className="flex items-center gap-1.5">
                <div className="p-1 glass rounded-lg border border-white/10">
                  {isMuted
                    ? <MicOff size={12} className="text-red-400" />
                    : <Mic    size={12} className="text-green-400" />}
                </div>
                <div className="p-1 glass rounded-lg border border-white/10">
                  {isCamOff
                    ? <CameraOff size={12} className="text-red-400" />
                    : <Camera    size={12} className="text-teal-400" />}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
