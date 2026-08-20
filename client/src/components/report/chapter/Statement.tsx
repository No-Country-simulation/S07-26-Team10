"use client"

import type { ReactNode } from "react"

interface StripItem {
  t: string
  d: string
}

export function Statement({
  quote,
  strip,
  src,
  words = false,
}: {
  quote: ReactNode
  strip: StripItem[]
  src: string
  words?: boolean
}) {
  return (
    <div className="stmt rv">
      <p className="stmt-t">{quote}</p>
      <div className={`strip${words ? " words" : ""}`}>
        {strip.map((s) => (
          <div key={s.t}>
            <span>{s.t}</span>
            <b>{s.d}</b>
          </div>
        ))}
      </div>
      <div className="stmt-src">{src}</div>
    </div>
  )
}