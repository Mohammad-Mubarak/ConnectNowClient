'use client'
import { useState } from 'react'
import { useWebRTC } from '@/hooks/useWebRTC'
import VideoCard from '@/components/VideoCard'
import ControlBar from '@/components/ControlBar'
import ChatBox from '@/components/ChatBox'

export default function ChatPage() {
  const [mode, setMode] = useState('video')  // 'video' | 'audio'
  const [chatOpen, setChatOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const {
    localStream, remoteStream,
    status, isMuted, isCamOff,
    messages, chatReady,
    sendMessage,
    findStranger, cancelSearch, skipStranger,
    toggleMute, toggleCamera,
  } = useWebRTC(mode)

  const isSearching = status === 'waiting' || status === 'connecting'

  return (
    <div className="flex flex-col h-screen bg-[#060b14] text-white overflow-hidden">

      {/* Mode toggle */}
      <div className="flex justify-center gap-2 pt-4">
        {['video', 'audio'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${mode === m
                ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                : 'glass border border-white/10 text-gray-400 hover:bg-white/5'
              }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Video cards + chat panel */}
      <div className="flex flex-1 gap-3 p-3 md:p-4 min-h-0">
        {/* Left: Video cards stacked */}
        <div className="flex flex-col flex-1 gap-3 min-h-0">
          {/* Remote (top) */}
          <VideoCard
            label="Stranger"
            stream={remoteStream}
            isSearching={isSearching}
            isYou={false}
            mode={mode}
          />
          {/* Local (bottom) */}
          <VideoCard
            label="You"
            stream={localStream}
            isYou
            mode={mode}
            isMuted={isMuted}
            isCamOff={isCamOff}
          />
        </div>

        {/* Right: Chat panel */}
        {chatOpen && (
          <div className="w-72 min-w-[260px] flex flex-col">
            <ChatBox
              messages={messages}
              onSend={sendMessage}
              chatReady={chatReady}
              visible={chatOpen}
            />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <ControlBar
        mode={mode}
        status={status}
        isMuted={isMuted}
        isCamOff={isCamOff}
        onFind={findStranger}       // ← must match exactly
        onCancel={cancelSearch}     // ← must match exactly
        onSkip={skipStranger}       // ← must match exactly
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onChatClick={() => setChatOpen(p => !p)}
        onFilterClick={() => setFilterOpen(true)}
      />


      {/* Filter bottom sheet — wire your own FilterSheet here */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="w-full glass border border-white/10 rounded-t-3xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-center text-gray-400 text-sm">Filters coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}
