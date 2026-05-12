import React, { useEffect, useRef } from 'react'

interface MoveHistoryProps {
  pgn: string
}

interface Move { number: number; white: string; black?: string }

function parsePgn(pgn: string): Move[] {
  const moves: Move[] = []
  const tokens = pgn.trim().split(/\s+/)
  let current: Move | null = null
  for (const t of tokens) {
    if (/^\d+\./.test(t)) {
      if (current) moves.push(current)
      current = { number: parseInt(t), white: '' }
    } else if (current) {
      if (!current.white) current.white = t
      else { current.black = t; moves.push(current); current = null }
    }
  }
  if (current && current.white) moves.push(current)
  return moves
}

export default function MoveHistory({ pgn }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const moves = parsePgn(pgn)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [pgn])

  if (moves.length === 0) {
    return (
      <div className="card h-40 flex items-center justify-center text-chess-text text-sm">
        No moves yet
      </div>
    )
  }

  return (
    <div className="card overflow-y-auto h-48 text-sm">
      <table className="w-full">
        <tbody>
          {moves.map(m => (
            <tr key={m.number} className="hover:bg-chess-hover">
              <td className="py-0.5 px-2 text-chess-text w-10">{m.number}.</td>
              <td className="py-0.5 px-2 text-chess-bright font-medium w-24">{m.white}</td>
              <td className="py-0.5 px-2 text-chess-bright font-medium">{m.black || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={bottomRef} />
    </div>
  )
}
