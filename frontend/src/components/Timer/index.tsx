import React, { useEffect, useRef, useState } from 'react'

interface TimerProps {
  timeMs: number
  isActive: boolean
  color: 'white' | 'black'
  onTimeout?: () => void
}

function formatTime(ms: number) {
  if (ms <= 0) return '0:00'
  const totalSecs = Math.floor(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  if (ms < 10000) {
    const tenths = Math.floor((ms % 1000) / 100)
    return `${secs}.${tenths}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Timer({ timeMs, isActive, color, onTimeout }: TimerProps) {
  const [current, setCurrent] = useState(timeMs)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTick = useRef(Date.now())

  useEffect(() => { setCurrent(timeMs) }, [timeMs])

  useEffect(() => {
    if (isActive && current > 0) {
      lastTick.current = Date.now()
      ref.current = setInterval(() => {
        const now = Date.now()
        const delta = now - lastTick.current
        lastTick.current = now
        setCurrent(prev => {
          const next = prev - delta
          if (next <= 0) {
            clearInterval(ref.current!)
            onTimeout?.()
            return 0
          }
          return next
        })
      }, 100)
    }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [isActive, onTimeout])

  const bgClass = !isActive
    ? 'bg-chess-card text-chess-text'
    : current < 10000 ? 'bg-chess-red text-white'
    : current < 30000 ? 'bg-chess-yellow text-black'
    : 'bg-chess-dark text-white'

  return (
    <div className={`${bgClass} rounded px-4 py-2 font-mono font-bold text-2xl min-w-[100px] text-center transition-colors`}>
      {formatTime(current)}
    </div>
  )
}
