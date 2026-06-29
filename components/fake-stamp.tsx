"use client"

import * as React from "react"

import { Station } from "@/lib/stations"

// Encres possibles (choisies de façon déterministe par gare).
const INKS = ["#B3261E", "#1F6F54", "#1D4E89", "#6D3C9A", "#A8521C"]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Quelques motifs « cliché » dessinés au centre du cachet.
function Motif({ kind }: { kind: number }) {
  switch (kind % 5) {
    case 0: // torii ⛩
      return (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <path d="M40 62 V44 M60 62 V44" />
          <path d="M34 43 H66" strokeWidth={3} />
          <path d="M37 48 H63" />
          <path d="M44 43 V40 M56 43 V40" />
        </g>
      )
    case 1: // mont Fuji
      return (
        <g stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round">
          <path d="M34 60 L50 40 L66 60 Z" fill="none" />
          <path d="M44 49 L50 44 L56 49 L52 47 L50 50 L48 47 Z" fill="currentColor" stroke="none" />
        </g>
      )
    case 2: // vagues
      return (
        <g fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M34 46 q4 -6 8 0 t8 0 t8 0" />
          <path d="M34 53 q4 -6 8 0 t8 0 t8 0" />
          <path d="M34 60 q4 -6 8 0 t8 0 t8 0" />
        </g>
      )
    case 3: // lanterne
      return (
        <g stroke="currentColor" strokeWidth={2.2}>
          <rect x={42} y={43} width={16} height={20} rx={7} fill="none" />
          <path d="M46 40 H54 M44 49 H56 M44 56 H56" fill="none" />
        </g>
      )
    default: // train
      return (
        <g stroke="currentColor" strokeWidth={2.2} fill="none" strokeLinejoin="round">
          <path d="M41 42 H59 a3 3 0 0 1 3 3 V58 H38 V45 a3 3 0 0 1 3 -3 Z" />
          <path d="M38 50 H62" />
          <circle cx={44} cy={61} r={1.6} fill="currentColor" stroke="none" />
          <circle cx={56} cy={61} r={1.6} fill="currentColor" stroke="none" />
        </g>
      )
  }
}

export function FakeStamp({
  station,
  className,
}: {
  station: Station
  className?: string
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const fid = `rough-${uid}`
  const h = hashStr(station.id)
  const ink = INKS[h % INKS.length]
  const seed = h % 100
  const romaji = station.name.toUpperCase()

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ color: ink }}
      role="img"
      aria-label={`Cachet ${station.name}`}
    >
      <defs>
        <filter id={fid}>
          <feTurbulence
            type="turbulence"
            baseFrequency="0.06 0.09"
            numOctaves={2}
            seed={seed}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
        <path id={`top-${uid}`} d="M 16 50 A 34 34 0 0 1 84 50" fill="none" />
        <path id={`bot-${uid}`} d="M 18 50 A 32 32 0 0 0 82 50" fill="none" />
      </defs>

      <g filter={`url(#${fid})`} opacity={0.92}>
        <circle cx={50} cy={50} r={46} fill="none" stroke="currentColor" strokeWidth={2.6} />
        <circle cx={50} cy={50} r={40} fill="none" stroke="currentColor" strokeWidth={1.4} />

        <text
          fill="currentColor"
          fontSize={13}
          fontWeight={700}
          textLength={58}
          lengthAdjust="spacingAndGlyphs"
        >
          <textPath href={`#top-${uid}`} startOffset="50%" textAnchor="middle">
            {station.nameJp}
          </textPath>
        </text>

        <text
          fill="currentColor"
          fontSize={7.5}
          fontWeight={600}
          letterSpacing={1}
          textLength={54}
          lengthAdjust="spacingAndGlyphs"
        >
          <textPath href={`#bot-${uid}`} startOffset="50%" textAnchor="middle">
            {romaji}
          </textPath>
        </text>

        <Motif kind={h} />
      </g>
    </svg>
  )
}
