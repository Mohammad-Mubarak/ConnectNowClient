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
import { Camera, CameraOff, Mic, MicOff, Maximize2, Users, Radio, Waves } from 'lucide-react'

// ✅ LiveWaveform — uses AnalyserNode with SILENCE THRESHOLD
// Only shows bars when volume exceeds threshold (no false waves)
function LiveWaveform({ stream, color = '#2dd4bf', barCount = 11, isYou = false }) {
  const [bars, setBars]       = useState(new Array(barCount).fill(3))
  const animRef               = useRef(null)
  const ctxRef                = useRef(null)

  useEffect(() => {
    if (!stream) {
      setBars(new Array(barCount).fill(3))
      return
    }

    // ✅ For YOUR stream: analyse audio but DO NOT connect to destination
    // This prevents any possibility of audio loopback/echo from the analyser
    const audioCtx  = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current  = audioCtx

    const source    = audioCtx.createMediaStreamSource(stream)
    const analyser  = audioCtx.createAnalyser()
    analyser.fftSize               = 128
    analyser.smoothingTimeConstant = 0.75

    // ✅ CRITICAL: source → analyser ONLY, never to audioCtx.destination
    // This is what causes echo — never do: source.connect(audioCtx.destination)
    source.connect(analyser)
    // analyser is NOT connected to destination — audio does NOT play through speakers

    const data       = new Uint8Array(analyser.frequencyBinCount)
    const SILENCE_THRESHOLD = 8 // ✅ ignore noise below this level (0-255)

    const tick = () => {
      analyser.getByteFrequencyData(data)

      // Calculate average volume
      const avg = data.reduce((s, v) => s + v, 0) / data.length

      let heights
      if (avg < SILENCE_THRESHOLD) {
        // ✅ Below threshold = flat line (no false animation)
        heights = new Array(barCount).fill(3)
      } else {
        const step = Math.floor(data.length / barCount)
        heights = Array.from({ length: barCount }, (_, i) => {
          const val = data[i * step] || 0
          return Math.max(3, Math.round((val / 255) * 38))
        })
      }

      setBars(heights)
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
      try { source.disconnect(); } catch(_) {}
      audioCtx.close()
    }
  }, [stream, barCount])

  return (
    <div className="flex items-end gap-1 h-10">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-75"
          style={{ height: `${h}px`, backgroundColor: color }}
        />
      ))}
    </div>
  )
}

// ─── Main VideoCard ──────────────────────────────────────────────────────────
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
  const audioRef = useRef(null)
  const isAudio  = mode === 'audio'

  // Video mode: attach stream to <video>
  useEffect(() => {
    if (videoRef.current && stream && !isYou) {
      videoRef.current.srcObject = stream
      videoRef.current.muted = false // stranger video plays audio
    }
    if (videoRef.current && stream && isYou) {
      videoRef.current.srcObject = stream
      videoRef.current.muted = true  // ✅ own preview always muted
    }
  }, [stream, isYou])

  // ✅ Audio mode: attach stranger stream to <audio> element
  // Never attach your own stream — that's the main echo source
  useEffect(() => {
    if (!audioRef.current || !stream || isYou) return
    audioRef.current.srcObject = stream
    audioRef.current.muted     = false
    // ✅ Play it — browser may require this after srcObject set
    audioRef.current.play().catch(e => console.warn('Audio play error:', e))
  }, [stream, isYou])

  return (
    <div className={`relative rounded-2xl overflow-hidden flex-1 glass border transition-all duration-500 ${
      isAudio
        ? isYou ? 'border-teal-500/30 min-h-[340px]' : 'border-violet-500/30 min-h-[340px]'
        : isYou ? 'border-teal-500/30 glow-teal min-h-[340px]' : 'border-violet-500/30 glow-purple min-h-[340px]'
    }`}>

      {/* ✅ ONLY for stranger in audio mode — plays their voice through speakers */}
      {!isYou && isAudio && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          // ✅ never muted — this is how we hear the stranger
          style={{ display: 'none' }}
        />
      )}

      {/* ─── AUDIO MODE ─── */}
      {isAudio ? (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-6 ${
          isYou
            ? 'bg-gradient-to-br from-[#0a1a1a] to-[#0d1f2d]'
            : 'bg-gradient-to-br from-[#0f0a1e] to-[#150d2a]'
        }`}>
          <div className={`absolute inset-0 opacity-20 ${
            isYou
              ? 'bg-[radial-gradient(ellipse_at_center,_#14b8a6_0%,_transparent_70%)]'
              : 'bg-[radial-gradient(ellipse_at_center,_#8b5cf6_0%,_transparent_70%)]'
          }`} />

          {isSearching && !isYou ? (
            /* Searching animation */
            <div className="relative flex flex-col items-center gap-5 z-10">
              <div className="relative flex items-center justify-center">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="absolute rounded-full border border-violet-400/30"
                    style={{
                      width:  `${60 + i * 40}px`,
                      height: `${60 + i * 40}px`,
                      animation: `ripple 2s ease-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
                <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 bg-violet-500/10 border-violet-400/50">
                  <Radio size={28} className="text-violet-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-violet-300">Finding voice partner</p>
                <div className="flex justify-center gap-1 mt-1.5">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block"
                      style={{ animation:'bounce 1s infinite', animationDelay:`${i*0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

          ) : (
            /* Live / idle state */
            <div className="relative flex flex-col items-center gap-5 z-10">
              <div className="relative flex items-center justify-center">
                {[1,2,3].map(i => (
                  <div key={i} className={`absolute rounded-full ${
                    isYou
                      ? 'bg-teal-400/5 border border-teal-400/20'
                      : 'bg-violet-400/5 border border-violet-400/20'
                  }`} style={{
                    width:  `${72 + i * 36}px`,
                    height: `${72 + i * 36}px`,
                    animation: `pulse-ring ${1.2 + i*0.3}s ease-in-out infinite`,
                    animationDelay: `${i*0.2}s`,
                  }} />
                ))}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-2 z-10 ${
                  isYou
                    ? 'bg-gradient-to-br from-teal-500/30 to-teal-700/20 border-teal-400/60'
                    : 'bg-gradient-to-br from-violet-500/30 to-violet-700/20 border-violet-400/60'
                }`}>
                  {isYou ? '👤' : '?'}
                </div>
              </div>

              {/* ✅ Real-time waveform with silence threshold */}
              <LiveWaveform
                stream={stream}
                color={isYou ? '#2dd4bf' : '#8b5cf6'}
                barCount={11}
                isYou={isYou}
              />

              <p className={`text-xs font-medium ${isYou ? 'text-teal-300' : 'text-violet-300'}`}>
                {isYou ? 'Your Mic' : 'Stranger'}
              </p>
            </div>
          )}

          {/* Top badge */}
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold glass border ${
            isYou ? 'border-teal-500/30 text-teal-300' : 'border-violet-500/30 text-violet-300'
          }`}>
            {isMuted
              ? <MicOff size={10} className="text-red-400" />
              : <Mic size={10} />}
            {label} · Audio
          </div>

          {/* Bottom status */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                isYou
                  ? 'bg-teal-400 animate-pulse'
                  : isSearching
                    ? 'bg-yellow-400 animate-ping'
                    : stream
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-gray-500'
              }`} />
              <span className="text-xs text-gray-400">
                {isYou
                  ? (isMuted ? 'Muted' : 'Mic Live')
                  : isSearching
                    ? 'Searching...'
                    : stream
                      ? 'Connected'
                      : 'Waiting...'}
              </span>
            </div>
            {isYou && (
              <div className="p-1 glass rounded-lg border border-white/10">
                <Waves size={12} className="text-teal-400" />
              </div>
            )}
          </div>
        </div>

      ) : (
        /* ─── VIDEO MODE ─── */
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">

          {stream && !isCamOff && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isYou}  // ✅ own preview muted, stranger video NOT muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {(!stream || isCamOff) && (
            isYou ? (
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/30 to-teal-600/20 border border-teal-500/40 flex items-center justify-center">
                  {isCamOff
                    ? <CameraOff size={32} className="text-red-400" />
                    : <Camera    size={32} className="text-teal-400" />}
                </div>
                <p className="text-gray-400 text-sm">
                  {isCamOff ? 'Camera off' : 'Camera preview'}
                </p>
              </div>
            ) : isSearching ? (
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Users size={24} className="text-violet-400" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-violet-400/20 animate-spin"
                    style={{ animationDuration:'3s' }}>
                    <div className="absolute -top-1 left-1/2 w-2 h-2 bg-violet-400 rounded-full -translate-x-1/2" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-violet-300 text-sm font-medium">Finding a stranger</p>
                  <div className="flex justify-center gap-1 mt-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block"
                        style={{ animation:'bounce 1s infinite', animationDelay:`${i*0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-20 h-20 rounded-full bg-gray-700/50 border border-gray-600/30 flex items-center justify-center">
                  <CameraOff size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-500 text-sm">Waiting to connect...</p>
              </div>
            )
          )}

          <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold glass border z-20 ${
            isYou ? 'border-teal-500/30 text-teal-300' : 'border-violet-500/30 text-violet-300'
          }`}>
            {label}
          </div>

          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            className="absolute top-3 right-3 p-1.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-all z-20"
          >
            <Maximize2 size={14} className="text-gray-400" />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                isYou ? 'bg-teal-400' : 'bg-violet-400'
              } animate-pulse`} />
              <span className="text-xs text-gray-400">
                {isYou
                  ? (isCamOff ? 'Cam off' : 'Live')
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
