'use client'
import { useState } from 'react'
import VideoCard   from '@/components/VideoCard'
import ControlBar  from '@/components/ControlBar'
import ChatBox     from '@/components/ChatBox'
import { useWebRTC } from '@/components/hooks/useWebRTC'

export default function Home() {
  const [mode, setMode]           = useState('video')  // 'video' | 'audio'
  const [chatOpen, setChatOpen]   = useState(false)

  const {
    localStream,
    remoteStream,
    status,
    isMuted,
    isCamOff,
    messages,
    chatReady,
    sendMessage,
    findStranger,
    cancelSearch,
    skipStranger,
    toggleMute,
    toggleCamera,
  } = useWebRTC(mode)

  const isSearching  = status === 'waiting'
  const isConnecting = status === 'connecting'
  const isConnected  = status === 'connected'

  return (
    <main className="min-h-screen bg-[#080c14] text-white flex flex-col items-center justify-center p-4 gap-4">

      {/* Mode Toggle */}
      <div className="flex gap-2">
        {['video', 'audio'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              mode === m
                ? 'bg-teal-500/20 border-teal-400/60 text-teal-300'
                : 'border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            {m === 'video' ? '📹 Video' : '🎙️ Audio'}
          </button>
        ))}
      </div>

      {/* Video Cards */}
      <div className="flex gap-4 w-full max-w-4xl">

        {/* Your card */}
        <VideoCard
          label="You"
          stream={localStream}
          isYou={true}
          mode={mode}
          isMuted={isMuted}
          isCamOff={isCamOff}
        />

        {/* Stranger's card */}
        <VideoCard
          label="Stranger"
          stream={remoteStream}
          isSearching={isSearching || isConnecting}
          isYou={false}
          mode={mode}
          isMuted={false}
          isCamOff={false}
        />

      </div>

      {/* Controls */}
      <ControlBar
        mode={mode}
        status={status}
        isMuted={isMuted}
        isCamOff={isCamOff}
        onFind={findStranger}
        onCancel={cancelSearch}
        onSkip={skipStranger}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onChatClick={() => setChatOpen(p => !p)}
      />

      {/* Chat Panel */}
      {chatOpen && (
        <ChatBox
          messages={messages}
          chatReady={chatReady}
          onSend={sendMessage}
          isConnected={isConnected}
        />
      )}

    </main>
  )
}
