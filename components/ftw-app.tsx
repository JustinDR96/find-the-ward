"use client"

import * as React from "react"
import { Check, Compass, MapPin, Pencil, Route, RotateCcw, Stamp, X } from "lucide-react"

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find the Ward
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tournez la roue, découvrez un quartier de Tokyo à explorer.
        </p>
      </header>

      {/* Sélecteur de mode */}
      <div className="inline-flex rounded-full border border-border bg-background p-1">
        {MODES.map((m) => {
          const active = mode === m.value
          return (
            <button
              key={m.value}
              onClick={() => switchMode(m.value)}
              aria-pressed={active}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
                (active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted")
              }
            >
              {m.icon}
              {m.label}
            </button>
          )
        })}
      </div>

      {mode === "trip" && (
        <div className="-mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Gares par voyage&nbsp;:</span>
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setTripSize(n)}
              aria-pressed={tripSize === n}
              className={
                "size-7 rounded-md border text-sm transition-colors " +
                (tripSize === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted")
              }
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <Wheel
        stations={startPool}
        onResult={handleResult}
        onSpinStart={clearResults}
        emptyLabel={emptyLabel}
      />

      {/* Résultat simple (Découverte / Cachets ratés) */}
      {result && (
        <Card className="w-full max-w-md text-center">
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
        <Card className="w-full max-w-md">
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
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-sky-500/15 text-sky-600 dark:text-sky-400")
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

      {/* Suivi des visites */}
      {hydrated && (
        <section className="w-full max-w-md">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Visitées{" "}
              <span className="text-muted-foreground">
                {visited.length} / {STATIONS.length}
              </span>
              {pendingStampIds.size > 0 && (
                <span className="ml-2 text-amber-500">
                  · {pendingStampIds.size} cachet
                  {pendingStampIds.size > 1 ? "s" : ""} à reprendre
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                aria-pressed={managing}
                onClick={() => setManaging((m) => !m)}
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

          {/* Pré-remplissage : cochez les gares déjà visitées */}
          {managing && (
            <div className="mb-4 rounded-lg border border-border p-3">
              <p className="mb-2 text-xs text-muted-foreground">
                Cochez les quartiers que vous avez déjà visités.
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
                            ? "border-transparent bg-emerald-500 text-white"
                            : "border-border bg-background hover:bg-muted")
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
            <p className="text-sm text-muted-foreground">
              Aucune gare visitée pour l’instant. À vous de jouer&nbsp;!
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {visited.map((v) => {
                const s = STATIONS.find((x) => x.id === v.id)
                if (!s) return null
                return (
                  <li
                    key={v.id}
                    className="flex items-center gap-2 px-3 py-2"
                  >
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
  )
}
