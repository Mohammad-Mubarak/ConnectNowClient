'use client'
import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export default function ChatBox({ messages, onSend, chatReady, visible }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!visible) return null

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full glass border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">Chat</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          chatReady ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {chatReady ? 'P2P' : 'Relay'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-xs mt-4">
            Messages are end-to-end when P2P
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
              msg.fromMe
                ? 'bg-teal-500/20 text-teal-100 rounded-br-sm'
                : 'bg-white/10 text-gray-200 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-teal-500/40"
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500/30 transition-all"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
