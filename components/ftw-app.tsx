"use client"

import * as React from "react"
import { Check, Compass, MapPin, Pencil, Route, RotateCcw, Stamp, Volume2, VolumeX, X } from "lucide-react"

import { LINES, STATIONS, Station } from "@/lib/stations"
import { useVisited } from "@/lib/use-visited"
import { buildTrip, distanceKm } from "@/lib/trip"
import { Wheel } from "@/components/wheel"
import { StampControl } from "@/components/stamp-control"
import { FakeStamp } from "@/components/fake-stamp"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Mode = "discover" | "stamps" | "trip"

const MODES: { value: Mode; label: string; icon: React.ReactNode }[] = [
  { value: "discover", label: "Découverte", icon: <Compass className="size-4" /> },
  { value: "stamps", label: "Cachets ratés", icon: <Stamp className="size-4" /> },
  { value: "trip", label: "Voyage", icon: <Route className="size-4" /> },
]

function LineBadges({ station }: { station: Station }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {station.lines.map((code) => {
        const line = LINES[code]
        return (
          <span
            key={code}
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: line.color }}
          >
            {line.name}
          </span>
        )
      })}
    </div>
  )
}

export function FtwApp() {
  const {
    visited,
    visitedIds,
    pendingStampIds,
    stampOf,
    markVisited,
    unmarkVisited,
    toggleVisited,
    setStamp,
    reset,
    hydrated,
  } = useVisited()

  const [mode, setMode] = React.useState<Mode>("discover")
  const [result, setResult] = React.useState<Station | null>(null)
  const [trip, setTrip] = React.useState<Station[] | null>(null)
  const [tripSize, setTripSize] = React.useState(4)
  const [managing, setManaging] = React.useState(false)
  const [muted, setMuted] = React.useState(false)

  // Pools selon le mode.
  const unvisited = React.useMemo(
    () => STATIONS.filter((s) => !visitedIds.has(s.id)),
    [visitedIds]
  )
  const pending = React.useMemo(
    () => STATIONS.filter((s) => pendingStampIds.has(s.id)),
    [pendingStampIds]
  )
  // « À faire » = non visitées + cachets ratés (pour les voyages).
  const todo = React.useMemo(
    () => STATIONS.filter((s) => !visitedIds.has(s.id) || pendingStampIds.has(s.id)),
    [visitedIds, pendingStampIds]
  )

  const startPool =
    mode === "discover" ? unvisited : mode === "stamps" ? pending : todo

  const emptyLabel =
    mode === "discover"
      ? "Tout visité 🎉"
      : mode === "stamps"
        ? "Aucun cachet à reprendre 🎉"
        : "Rien à programmer 🎉"

  function clearResults() {
    setResult(null)
    setTrip(null)
  }

  function handleResult(s: Station) {
    if (mode === "trip") {
      setResult(null)
      setTrip(buildTrip(s, todo, tripSize))
    } else {
      setTrip(null)
      setResult(s)
    }
  }

  function switchMode(m: Mode) {
    setMode(m)
    clearResults()
  }

  const visitedPct = STATIONS.length
    ? Math.round((visited.length / STATIONS.length) * 100)
    : 0

  return (
    <div className="relative flex min-h-dvh w-full justify-center px-4 py-8 sm:py-12">
      <div className="flex w-full max-w-xl flex-col items-center gap-7">
        <header className="flex w-full items-start justify-between gap-4">
          <div>
            <h1 className="bg-linear-to-r from-white to-white/70 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
              Find the Ward
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Découvre un quartier de Tokyo au hasard.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={muted ? "Activer le son" : "Couper le son"}
            aria-pressed={muted}
            onClick={() => setMuted((m) => !m)}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 text-muted-foreground backdrop-blur-xl"
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </Button>
        </header>

        {/* Sélecteur de mode — segmenté en verre */}
        <div className="flex w-full rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
          {MODES.map((m) => {
            const active = mode === m.value
            return (
              <button
                key={m.value}
                onClick={() => switchMode(m.value)}
                aria-pressed={active}
                className={
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-white/10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/15"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            )
          })}
        </div>

        {mode === "trip" && (
          <div className="-mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Gares par voyage&nbsp;:</span>
            {[3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setTripSize(n)}
                aria-pressed={tripSize === n}
                className={
                  "size-8 rounded-lg border text-sm transition-colors " +
                  (tripSize === n
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-white/10 bg-white/5 hover:bg-white/10")
                }
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {/* Carte héro : la roue */}
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-5">
            <Wheel
              stations={startPool}
              onResult={handleResult}
              onSpinStart={clearResults}
              emptyLabel={emptyLabel}
              muted={muted}
            />
            <p className="text-center text-sm text-muted-foreground">
              {startPool.length === 0
                ? emptyLabel
                : "Appuie sur Tirer au centre de la roue."}
            </p>
          </div>
        </div>

      {/* Résultat simple (Découverte / Cachets ratés) */}
      {result && (
        <Card className="w-full border-white/10 text-center backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-4xl font-bold tracking-tight">
              {result.name}
            </CardTitle>
            <p className="text-2xl text-muted-foreground">{result.nameJp}</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {result.ward}
            </div>
            <LineBadges station={result} />
            {!visitedIds.has(result.id) && (
              <Button onClick={() => markVisited(result.id)}>
                <Check /> Marquer comme visitée
              </Button>
            )}
            {stampOf(result.id) === "collected" && (
              <div className="animate-stamp-impact">
                <FakeStamp
                  key={result.id}
                  station={result}
                  className="size-40 animate-stamp-slam"
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Cachet</span>
              <StampControl
                value={stampOf(result.id)}
                onChange={(s) => setStamp(result.id, s)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carte trajet (Voyage) */}
      {trip && trip.length > 0 && (
        <Card className="w-full border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Route className="size-5" /> Voyage proposé
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {trip.length} gares ·{" "}
                {trip
                  .reduce(
                    (acc, s, i) =>
                      i === 0 ? 0 : acc + distanceKm(trip[i - 1], s),
                    0
                  )
                  .toFixed(1)}{" "}
                km
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {trip.map((s, i) => {
                const isStamp = pendingStampIds.has(s.id)
                return (
                  <li key={s.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                      {i < trip.length - 1 && (
                        <span className="my-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {s.nameJp}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {s.ward}
                        </span>
                        {i > 0 && (
                          <span>· {distanceKm(trip[i - 1], s).toFixed(1)} km</span>
                        )}
                        <span
                          className={
                            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium " +
                            (isStamp
                              ? "bg-amber-400/15 text-amber-300"
                              : "bg-cyan-400/15 text-cyan-300")
                          }
                        >
                          {isStamp ? (
                            <>
                              <Stamp className="size-3" /> Cachet à reprendre
                            </>
                          ) : (
                            <>
                              <Compass className="size-3" /> À découvrir
                            </>
                          )}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StampControl
                          compact
                          value={stampOf(s.id)}
                          onChange={(st) => setStamp(s.id, st)}
                        />
                        {stampOf(s.id) === "collected" && (
                          <FakeStamp
                            key={s.id}
                            station={s}
                            className="size-12 shrink-0 animate-stamp-slam"
                          />
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Suivi des visites — carte verre */}
      {hydrated && (
        <section className="w-full rounded-3xl border border-white/10 bg-white/4 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-semibold">Visitées</h2>
              <span className="text-sm text-muted-foreground">
                {visited.length}/{STATIONS.length}
              </span>
              {pendingStampIds.size > 0 && (
                <span className="text-xs text-amber-300">
                  · {pendingStampIds.size} à reprendre
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={managing}
                onClick={() => setManaging((m) => !m)}
                className="border border-white/10 bg-white/5"
              >
                <Pencil /> {managing ? "Terminé" : "Pré-remplir"}
              </Button>
              {visited.length > 0 && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw /> Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full [background:linear-gradient(90deg,#8b5cf6,#ec4899,#22d3ee)] transition-[width] duration-500"
              style={{ width: `${visitedPct}%` }}
            />
          </div>

          {/* Pré-remplissage : cochez les gares déjà visitées */}
          {managing && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/3 p-3">
              <p className="mb-2 text-xs text-muted-foreground">
                Coche les quartiers que tu as déjà visités.
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {STATIONS.map((s) => {
                  const on = visitedIds.has(s.id)
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => toggleVisited(s.id)}
                        aria-pressed={on}
                        className={
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors " +
                          (on
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-white/10 bg-white/5 hover:bg-white/10")
                        }
                      >
                        {on && <Check className="size-3" />}
                        {s.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {visited.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucune gare visitée pour l’instant. À toi de jouer&nbsp;!
            </p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-white/5">
              {visited.map((v) => {
                const s = STATIONS.find((x) => x.id === v.id)
                if (!s) return null
                return (
                  <li key={v.id} className="flex items-center gap-2 py-2">
                    <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {s.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {s.nameJp}
                      </span>
                    </span>
                    <StampControl
                      compact
                      value={stampOf(v.id)}
                      onChange={(st) => setStamp(v.id, st)}
                    />
                    <button
                      onClick={() => unmarkVisited(v.id)}
                      title="Retirer des visitées"
                      className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
      </div>
    </div>
  )
}
