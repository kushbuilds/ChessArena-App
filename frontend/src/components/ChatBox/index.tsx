import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { ChatMessage } from '../../types'

interface ChatBoxProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
  currentUsername: string
}

export default function ChatBox({ messages, onSend, currentUsername }: ChatBoxProps) {
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {messages.length === 0 && (
          <p className="text-chess-text text-xs text-center py-4">Say hi to your opponent!</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-xs ${m.sender === currentUsername ? 'text-right' : ''}`}>
            <span className="text-chess-text">{m.sender === currentUsername ? 'You' : m.sender}: </span>
            <span className="text-chess-bright">{m.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-2 border-t border-chess-border">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Message..."
          className="input text-xs py-1 flex-1"
        />
        <button onClick={handleSend} className="btn-secondary p-1.5"><Send size={14} /></button>
      </div>
    </div>
  )
}
