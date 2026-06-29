"use client"

import * as React from "react"

const STORAGE_KEY = "ftw:visited"

/** Statut du cachet (eki stamp) pour une gare visitée. */
export type StampStatus = "none" | "pending" | "collected"

export type VisitEntry = {
  id: string
  /** ISO date du jour où la gare a été marquée visitée */
  date: string
  /** Statut du cachet. Absent = "none" (rétro-compatible). */
  stamp?: StampStatus
}

function read(): VisitEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Garde la liste des gares visitées (+ statut de cachet), persistée dans le
 * navigateur (localStorage). Pas de compte, pas de serveur : local à l'appareil.
 */
export function useVisited() {
  const [visited, setVisited] = React.useState<VisitEntry[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setVisited(read())
    setHydrated(true)
  }, [])

  const persist = React.useCallback((next: VisitEntry[]) => {
    setVisited(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage indisponible (mode privé, quota) : on garde l'état mémoire
    }
  }, [])

  const visitedIds = React.useMemo(
    () => new Set(visited.map((v) => v.id)),
    [visited]
  )

  const pendingStampIds = React.useMemo(
    () => new Set(visited.filter((v) => v.stamp === "pending").map((v) => v.id)),
    [visited]
  )

  const collectedStampIds = React.useMemo(
    () =>
      new Set(visited.filter((v) => v.stamp === "collected").map((v) => v.id)),
    [visited]
  )

  const stampOf = React.useCallback(
    (id: string): StampStatus => {
      const e = visited.find((v) => v.id === id)
      return e?.stamp ?? "none"
    },
    [visited]
  )

  const markVisited = React.useCallback(
    (id: string) => {
      if (visitedIds.has(id)) return
      persist([...visited, { id, date: new Date().toISOString().slice(0, 10) }])
    },
    [visited, visitedIds, persist]
  )

  const unmarkVisited = React.useCallback(
    (id: string) => {
      persist(visited.filter((v) => v.id !== id))
    },
    [visited, persist]
  )

  const toggleVisited = React.useCallback(
    (id: string) => {
      if (visitedIds.has(id)) {
        persist(visited.filter((v) => v.id !== id))
      } else {
        persist([...visited, { id, date: new Date().toISOString().slice(0, 10) }])
      }
    },
    [visited, visitedIds, persist]
  )

  /** Définit le statut de cachet (marque la gare visitée si besoin). */
  const setStamp = React.useCallback(
    (id: string, stamp: StampStatus) => {
      const existing = visited.find((v) => v.id === id)
      if (existing) {
        persist(visited.map((v) => (v.id === id ? { ...v, stamp } : v)))
      } else {
        persist([
          ...visited,
          { id, date: new Date().toISOString().slice(0, 10), stamp },
        ])
      }
    },
    [visited, persist]
  )

  const reset = React.useCallback(() => persist([]), [persist])

  return {
    visited,
    visitedIds,
    pendingStampIds,
    collectedStampIds,
    stampOf,
    markVisited,
    unmarkVisited,
    toggleVisited,
    setStamp,
    reset,
    hydrated,
  }
}
