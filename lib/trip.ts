import { Station } from "@/lib/stations"

/** Distance à vol d'oiseau entre deux gares, en kilomètres. */
export function distanceKm(a: Station, b: Station): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Longueur totale d'un parcours ouvert (somme des segments consécutifs). */
export function pathLength(stations: Station[]): number {
  let total = 0
  for (let i = 1; i < stations.length; i++) {
    total += distanceKm(stations[i - 1], stations[i])
  }
  return total
}

/** Permutations d'un tableau (taille raisonnable uniquement). */
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr]
  const out: T[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const p of permutations(rest)) out.push([arr[i], ...p])
  }
  return out
}

/**
 * Construit un trajet à partir d'une gare de départ :
 * 1. choisit les `size - 1` gares les plus proches dans le pool ;
 * 2. ordonne l'ensemble (départ fixé) pour minimiser la distance totale.
 *
 * `size` est borné pour garder l'optimisation exacte rapide.
 */
export function buildTrip(
  start: Station,
  pool: Station[],
  size: number
): Station[] {
  const others = pool
    .filter((s) => s.id !== start.id)
    .map((s) => ({ s, d: distanceKm(start, s) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.max(0, Math.min(size, 6) - 1))
    .map((x) => x.s)

  if (others.length === 0) return [start]

  let best: Station[] = [start, ...others]
  let bestLen = pathLength(best)
  for (const perm of permutations(others)) {
    const candidate = [start, ...perm]
    const len = pathLength(candidate)
    if (len < bestLen) {
      bestLen = len
      best = candidate
    }
  }
  return best
}
