"use client"

import * as React from "react"

import { Station } from "@/lib/stations"

const C = 50 // centre du viewBox

// Géométrie (rayons dans le viewBox 0–100).
const R_OUT = 50 // bord extérieur des quartiers
const R_IN = 20 // bord intérieur (trou central sous le bouton)

const SPIN_MS = 4200

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) }
}

/** Quartier annulaire (couronne) entre R_IN et R_OUT. */
function wedgePath(i: number, seg: number): string {
  const a0 = i * seg
  const a1 = (i + 1) * seg
  const o0 = polar(R_OUT, a0)
  const o1 = polar(R_OUT, a1)
  const n1 = polar(R_IN, a1)
  const n0 = polar(R_IN, a0)
  return `M ${o0.x.toFixed(2)} ${o0.y.toFixed(2)} A ${R_OUT} ${R_OUT} 0 0 1 ${o1.x.toFixed(2)} ${o1.y.toFixed(2)} L ${n1.x.toFixed(2)} ${n1.y.toFixed(2)} A ${R_IN} ${R_IN} 0 0 0 ${n0.x.toFixed(2)} ${n0.y.toFixed(2)} Z`
}

type WheelProps = {
  /** Gares éligibles au tirage (déjà filtrées par la page). */
  stations: Station[]
  onResult: (s: Station) => void
  onSpinStart?: () => void
  /** Libellé du bouton quand le pool est vide. */
  emptyLabel?: string
  /** Son coupé (contrôlé par le parent). */
  muted?: boolean
}

export function Wheel({
  stations,
  onResult,
  onSpinStart,
  emptyLabel = "Rien à tirer",
  muted = false,
}: WheelProps) {
  const n = stations.length
  const seg = n > 0 ? 360 / n : 360
  const [rotation, setRotation] = React.useState(0)
  const [spinning, setSpinning] = React.useState(false)
  const targetIndex = React.useRef<number | null>(null)

  // --- Son : clics synthétisés synchronisés sur la rotation réelle ---
  const audioCtxRef = React.useRef<AudioContext | null>(null)
  const mutedRef = React.useRef(false)
  const wheelElRef = React.useRef<HTMLDivElement>(null)
  const pointerRef = React.useRef<HTMLDivElement>(null)
  const rafRef = React.useRef<number | null>(null)
  const lastAngleRef = React.useRef(0)
  const tickAccumRef = React.useRef(0)

  React.useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!audioCtxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      audioCtxRef.current = new Ctor()
    }
    return audioCtxRef.current
  }

  function playTick() {
    if (mutedRef.current) return
    const ctx = getCtx()
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "square"
    osc.frequency.setValueAtTime(1150, t)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.05)
  }

  /** Angle courant (−180..180) lu sur le transform réellement rendu. */
  function currentAngle(): number {
    const el = wheelElRef.current
    if (!el) return 0
    const tr = getComputedStyle(el).transform
    if (!tr || tr === "none") return 0
    try {
      const m = new DOMMatrixReadOnly(tr)
      return (Math.atan2(m.b, m.a) * 180) / Math.PI
    } catch {
      return 0
    }
  }

  /** Donne un petit coup à la languette, puis retour par ressort. */
  function kickPointer() {
    const el = pointerRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.transform = "rotate(15deg)"
    void el.offsetWidth // force le reflow pour repartir du coup
    el.style.transition = "transform 240ms cubic-bezier(0.22, 1.6, 0.4, 1)"
    el.style.transform = "rotate(0deg)"
  }

  function tickLoop() {
    const a = currentAngle()
    let delta = a - lastAngleRef.current
    if (delta > 180) delta -= 360
    else if (delta < -180) delta += 360
    lastAngleRef.current = a
    tickAccumRef.current += Math.abs(delta)
    let crossed = false
    let guard = 0
    while (tickAccumRef.current >= seg && guard < 8) {
      tickAccumRef.current -= seg
      playTick()
      crossed = true
      guard++
    }
    if (crossed) kickPointer()
    rafRef.current = requestAnimationFrame(tickLoop)
  }

  function stopTicks() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  React.useEffect(() => stopTicks, [])

  function spin() {
    if (spinning || n === 0) return
    // Chaque quartier disponible = un segment ; on tire son index.
    const i = Math.floor(Math.random() * n)
    targetIndex.current = i
    onSpinStart?.()

    // Débloque l'audio (politique autoplay) sur ce geste utilisateur.
    getCtx()?.resume?.()

    // Aligne le centre du segment i sous le pointeur (en haut).
    const ci = i * seg + seg / 2
    const wantMod = (((-ci) % 360) + 360) % 360
    let target = rotation + 360 * 5
    const haveMod = ((target % 360) + 360) % 360
    target += ((wantMod - haveMod) + 360) % 360
    target += (Math.random() - 0.5) * seg * 0.6

    setSpinning(true)
    setRotation(target)

    // Démarre le suivi du son au prochain frame (transition lancée).
    lastAngleRef.current = currentAngle()
    tickAccumRef.current = 0
    stopTicks()
    rafRef.current = requestAnimationFrame(tickLoop)
  }

  function handleTransitionEnd() {
    if (!spinning) return
    stopTicks()
    setSpinning(false)
    const i = targetIndex.current
    if (i != null && stations[i]) onResult(stations[i])
  }

  const canSpin = !spinning && n > 0

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      {/* Pointeur néon */}
      <div className="absolute left-1/2 top-[-3%] z-30 -translate-x-1/2">
        <div
          ref={pointerRef}
          className="h-0 w-0 origin-top border-x-[11px] border-t-[18px] border-x-transparent border-t-[#22d3ee] drop-shadow-[0_0_7px_rgba(34,211,238,0.95)]"
        />
      </div>

      {/* Anneau dégradé lumineux (bord) + roue sombre */}
      <div className="absolute inset-0 rounded-full p-[3px] [background:conic-gradient(from_210deg,#8b5cf6,#ec4899,#22d3ee,#8b5cf6)] shadow-[0_0_60px_-10px_rgba(139,92,246,0.6),0_0_24px_-6px_rgba(236,72,153,0.5)]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#0c0e16]">
          <div
            ref={wheelElRef}
            className="h-full w-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.14, 0.99)`
                : undefined,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {n <= 1 ? (
                <circle
                  cx={C}
                  cy={C}
                  r={R_OUT}
                  fill="rgba(139,92,246,0.16)"
                />
              ) : (
                stations.map((s, i) => (
                  <path
                    key={s.id}
                    d={wedgePath(i, seg)}
                    fill={
                      i % 2 === 0
                        ? "rgba(139,92,246,0.18)"
                        : "rgba(255,255,255,0.03)"
                    }
                    stroke="rgba(255,255,255,0.14)"
                    strokeWidth={0.5}
                    strokeLinejoin="round"
                  />
                ))
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Bouton central — verre + dégradé néon */}
      <div className="absolute left-1/2 top-1/2 z-20 aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 p-[6%] backdrop-blur-md">
        <button
          type="button"
          onClick={spin}
          disabled={!canSpin}
          aria-label={n === 0 ? emptyLabel : "Tirer un quartier"}
          className="grid h-full w-full place-items-center rounded-full [background:linear-gradient(140deg,#8b5cf6,#ec4899)] text-base font-semibold tracking-wide text-white shadow-[0_0_30px_-4px_rgba(236,72,153,0.7),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-150 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {n === 0 ? "🎉" : "Tirer"}
        </button>
      </div>
    </div>
  )
}
