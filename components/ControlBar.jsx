// 'use client'
// import { useState } from 'react'
// import {
//   SkipForward, Zap, Mic, MicOff,
//   Camera, CameraOff, SlidersHorizontal, MessageSquare
// } from 'lucide-react'

// export default function ControlBar({ mode = 'video', onFilterClick }) {
//   const [muted, setMuted] = useState(false)
//   const [camOff, setCamOff] = useState(false)
//   const [searching, setSearching] = useState(false)

//   return (
//     <div className="flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 flex-wrap">

//       {/* Skip */}
//       <button className="flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl glass border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-200 font-semibold text-xs md:text-sm">
//         <SkipForward size={15} />
//         Skip
//       </button>

//       {/* Connect / Stop */}
//       <button
//         onClick={() => setSearching(!searching)}
//         className={`flex items-center gap-1.5 md:gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm text-white transition-all duration-300 ${
//           searching
//             ? 'bg-red-500/20 border border-red-500/40 hover:bg-red-500/30'
//             : 'gradient-btn glow-teal'
//         }`}
//       >
//         <Zap size={15} className={searching ? 'animate-pulse' : ''} />
//         {searching ? 'Stop' : 'Connect'}
//       </button>

//       {/* Mic Toggle */}
//       <button
//         onClick={() => setMuted(!muted)}
//         className={`p-2.5 md:p-3 rounded-2xl glass border transition-all duration-200 ${
//           muted
//             ? 'border-red-500/40 text-red-400 bg-red-500/10'
//             : 'border-white/10 text-gray-300 hover:bg-white/10'
//         }`}
//         title={muted ? 'Unmute' : 'Mute'}
//       >
//         {muted ? <MicOff size={16} /> : <Mic size={16} />}
//       </button>

//       {/* Camera Toggle — hidden in audio mode */}
//       {mode !== 'audio' && (
//         <button
//           onClick={() => setCamOff(!camOff)}
//           className={`p-2.5 md:p-3 rounded-2xl glass border transition-all duration-200 ${
//             camOff
//               ? 'border-red-500/40 text-red-400 bg-red-500/10'
//               : 'border-white/10 text-gray-300 hover:bg-white/10'
//           }`}
//           title={camOff ? 'Turn on camera' : 'Turn off camera'}
//         >
//           {camOff ? <CameraOff size={16} /> : <Camera size={16} />}
//         </button>
//       )}

//       {/* Chat */}
//       <button
//         className="p-2.5 md:p-3 rounded-2xl glass border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
//         title="Chat"
//       >
//         <MessageSquare size={16} />
//       </button>

//       {/* Filters — opens bottom sheet via onFilterClick */}
//       <button
//         onClick={onFilterClick}
//         className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl glass border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 transition-all text-xs md:text-sm font-medium"
//         title="Open Filters"
//       >
//         <SlidersHorizontal size={15} />
//         <span className="hidden sm:inline">Filters</span>
//       </button>

//     </div>
//   )
// }
















'use client'
import {
  SkipForward, Zap, Mic, MicOff,
  Camera, CameraOff, SlidersHorizontal, MessageSquare
} from 'lucide-react'

export default function ControlBar({
  mode = 'video',
  status,           // 'idle' | 'waiting' | 'connecting' | 'connected'
  isMuted,
  isCamOff,
  onFind,
  onCancel,
  onSkip,
  onToggleMute,
  onToggleCamera,
  onFilterClick,
  onChatClick,
}) {
  const isSearching = status === 'waiting' || status === 'connecting'
  const isConnected = status === 'connected'

  const handleMainBtn = () => {
    if (isConnected) return onSkip()      // skip current peer → find next
    if (isSearching) return onCancel()    // cancel queue
    return onFind()                       // start searching
  }

  const mainLabel = isConnected ? 'Next' : isSearching ? 'Stop' : 'Connect'
  const mainIcon  = isConnected ? <SkipForward size={15} /> : <Zap size={15} className={isSearching ? 'animate-pulse' : ''} />

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 flex-wrap">

      {/* Skip — only visible while connected */}
      {isConnected && (
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl glass border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-200 font-semibold text-xs md:text-sm"
        >
          <SkipForward size={15} />
          Skip
        </button>
      )}

      {/* Connect / Stop / Next */}
      <button
        onClick={handleMainBtn}
        className={`flex items-center gap-1.5 md:gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm text-white transition-all duration-300 ${
          isSearching || isConnected
            ? 'bg-red-500/20 border border-red-500/40 hover:bg-red-500/30'
            : 'gradient-btn glow-teal'
        }`}
      >
        {mainIcon}
        {mainLabel}
      </button>

      {/* Mic Toggle */}
      <button
        onClick={onToggleMute}
        className={`p-2.5 md:p-3 rounded-2xl glass border transition-all duration-200 ${
          isMuted
            ? 'border-red-500/40 text-red-400 bg-red-500/10'
            : 'border-white/10 text-gray-300 hover:bg-white/10'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
      </button>

      {/* Camera Toggle — hidden in audio mode */}
      {mode !== 'audio' && (
        <button
          onClick={onToggleCamera}
          className={`p-2.5 md:p-3 rounded-2xl glass border transition-all duration-200 ${
            isCamOff
              ? 'border-red-500/40 text-red-400 bg-red-500/10'
              : 'border-white/10 text-gray-300 hover:bg-white/10'
          }`}
          title={isCamOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isCamOff ? <CameraOff size={16} /> : <Camera size={16} />}
        </button>
      )}

      {/* Chat */}
      <button
        onClick={onChatClick}
        className="p-2.5 md:p-3 rounded-2xl glass border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
        title="Chat"
      >
        <MessageSquare size={16} />
      </button>

      {/* Filters */}
      <button
        onClick={onFilterClick}
        className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl glass border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 transition-all text-xs md:text-sm font-medium"
        title="Open Filters"
      >
        <SlidersHorizontal size={15} />
        <span className="hidden sm:inline">Filters</span>
      </button>

    </div>
  )
}
