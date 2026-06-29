"use client"

import * as React from "react"
import { Volume2, VolumeX } from "lucide-react"

import { Station, stationColor } from "@/lib/stations"
import { Button } from "@/components/ui/button"

const C = 50 // centre du viewBox
const R = 50 // rayon

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) }
}

function slicePath(i: number, seg: number): string {
  const a0 = i * seg
  const a1 = (i + 1) * seg
  const p0 = polar(R, a0)
  const p1 = polar(R, a1)
  const large = seg > 180 ? 1 : 0
  return `M ${C} ${C} L ${p0.x.toFixed(3)} ${p0.y.toFixed(3)} A ${R} ${R} 0 ${large} 1 ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} Z`
}

const SPIN_MS = 4200

// Rayon du moyeu central (Sharingan).
const HUB_R = 11

type WheelProps = {
  /** Gares éligibles au tirage (déjà filtrées par la page). */
  stations: Station[]
  onResult: (s: Station) => void
  onSpinStart?: () => void
  /** Libellé du bouton quand le pool est vide. */
  emptyLabel?: string
}

export function Wheel({
  stations,
  onResult,
  onSpinStart,
  emptyLabel = "Rien à tirer",
}: WheelProps) {
  const n = stations.length
  const seg = n > 0 ? 360 / n : 360
  const [rotation, setRotation] = React.useState(0)
  const [spinning, setSpinning] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
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
    const i = Math.floor(Math.random() * n)
    targetIndex.current = i
    onSpinStart?.()

    // Débloque l'audio (politique autoplay) sur ce geste utilisateur.
    getCtx()?.resume?.()

    // Aligne le centre du segment i sous le pointeur (en haut).
    const ci = i * seg + seg / 2
    const wantMod = ((-ci) % 360 + 360) % 360
    let target = rotation + 360 * 5
    const haveMod = ((target % 360) + 360) % 360
    target += ((wantMod - haveMod) + 360) % 360
    target += (Math.random() - 0.5) * seg * 0.7

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

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative aspect-square w-full max-w-[480px]">
        {/* Bouton muet */}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={muted ? "Activer le son" : "Couper le son"}
          aria-pressed={muted}
          onClick={() => setMuted((m) => !m)}
          className="absolute right-0 top-0 z-10 text-muted-foreground"
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>

        {/* Pointeur (languette qui réagit au passage des segments) */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <div
            ref={pointerRef}
            className="h-0 w-0 origin-top border-x-[12px] border-t-[20px] border-x-transparent border-t-foreground drop-shadow-md"
          />
        </div>

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
            <defs>
              <clipPath id="hub-clip">
                <circle cx={C} cy={C} r={HUB_R} />
              </clipPath>
            </defs>
            {n === 1 ? (
              <circle cx={C} cy={C} r={R} fill={stationColor(stations[0])} />
            ) : (
              stations.map((s, i) => (
                <path
                  key={s.id}
                  d={slicePath(i, seg)}
                  fill={stationColor(s)}
                  stroke="white"
                  strokeWidth={0.4}
                  strokeLinejoin="round"
                />
              ))
            )}
            {/* Moyeu central : image Sharingan, clippée en cercle pour
                masquer le fond du JPEG. Zoom léger (rayon image > clip). */}
            <image
              href="/sharingan.jpeg"
              x={C - HUB_R * 1.06}
              y={C - HUB_R * 1.06}
              width={HUB_R * 2 * 1.06}
              height={HUB_R * 2 * 1.06}
              clipPath="url(#hub-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
            <circle
              cx={C}
              cy={C}
              r={HUB_R}
              fill="none"
              stroke="#141414"
              strokeWidth={0.8}
            />
          </svg>
        </div>
      </div>

      <Button
        size="lg"
        onClick={spin}
        disabled={spinning || n === 0}
        className="h-12 px-8 text-base"
      >
        {n === 0 ? emptyLabel : spinning ? "..." : "Tourner la roue"}
      </Button>
    </div>
  )
}
