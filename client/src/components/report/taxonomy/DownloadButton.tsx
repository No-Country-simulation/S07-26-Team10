"use client"

import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface DownloadButtonProps {
  label: string
  description?: string
  onClick?: () => void
  className?: string
}

export function DownloadButton({
  label,
  description,
  onClick,
  className,
}: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-neutral-800 bg-neutral-900/50",
        "hover:bg-neutral-800/60 hover:border-neutral-700 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500",
        "text-left group",
        className,
      )}
    >
      <div className="size-9 rounded-lg bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-150 shrink-0">
        <Download className="size-4 text-neutral-400 group-hover:text-neutral-200 transition-colors duration-150" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-200 truncate">{label}</p>
        {description && (
          <p className="text-xs text-neutral-500 truncate">{description}</p>
        )}
      </div>
    </button>
  )
}
