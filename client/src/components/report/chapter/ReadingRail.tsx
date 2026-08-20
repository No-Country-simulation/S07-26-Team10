"use client"

import { useEffect, useRef, useState } from "react"

interface RailItem {
  id: string
  num: string
  title: string
}

export function ReadingRail() {
  const [items, setItems] = useState<RailItem[]>([])
  const [active, setActive] = useState(-1)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = [...document.querySelectorAll("section")].filter((s) =>
      s.querySelector(".shead .snum")
    )
    if (sections.length < 2) return

    const next: RailItem[] = sections.map((s, i) => {
      if (!s.id) s.id = `sec-${i + 1}`
      const n = s.querySelector(".shead .snum")?.textContent?.trim() ?? ""
      const t = s.querySelector(".shead h2")?.textContent?.trim() ?? ""
      return { id: s.id, num: n, title: t }
    })
    setItems(next)

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const i = sections.indexOf(entry.target as HTMLElement)
          setActive(i)
          const link = innerRef.current?.children[i]
          if (link instanceof HTMLElement && innerRef.current?.scrollTo) {
            innerRef.current.scrollTo({
              left: Math.max(0, link.offsetLeft - 24),
              behavior: "smooth",
            })
          }
        })
      },
      { rootMargin: "-25% 0px -60% 0px" }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  if (items.length < 2) return null

  return (
    <nav className="rail-read" aria-label="Sections">
      <div className="in" ref={innerRef}>
        {items.map((item, i) => (
          <a
            className={`rr${i === active ? " on" : ""}`}
            href={`#${item.id}`}
            key={item.id}
          >
            <b>{item.num}</b>
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}