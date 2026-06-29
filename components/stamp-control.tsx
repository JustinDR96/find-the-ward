"use client"

import * as React from "react"
import { Ban, Stamp, Check } from "lucide-react"

import { StampStatus } from "@/lib/use-visited"
import { cn } from "@/lib/utils"

const OPTIONS: {
  value: StampStatus
  label: string
  icon: React.ReactNode
  on: string
}[] = [
  {
    value: "none",
    label: "Pas de cachet",
    icon: <Ban className="size-3.5" />,
    on: "bg-muted-foreground/20 text-foreground",
  },
  {
    value: "pending",
    label: "À récupérer",
    icon: <Stamp className="size-3.5" />,
    on: "bg-amber-500 text-white",
  },
  {
    value: "collected",
    label: "Récupéré",
    icon: <Check className="size-3.5" />,
    on: "bg-emerald-500 text-white",
  },
]

export function StampControl({
  value,
  onChange,
  className,
  compact = false,
}: {
  value: StampStatus
  onChange: (s: StampStatus) => void
  className?: string
  /** Icônes seules (pour les listes serrées). */
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-background p-0.5",
        className
      )}
      role="group"
      aria-label="Statut du cachet"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors",
              compact ? "p-1.5" : "px-2.5 py-1",
              active ? opt.on : "text-muted-foreground hover:bg-muted"
            )}
          >
            {opt.icon}
            {!compact && opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** Petite pastille d'état pour les listes. */
export function StampDot({ status }: { status: StampStatus }) {
  if (status === "collected")
    return <Check className="size-3.5 text-emerald-500" />
  if (status === "pending") return <Stamp className="size-3.5 text-amber-500" />
  return null
}
