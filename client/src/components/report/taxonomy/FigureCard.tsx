"use client"

import { useTranslations } from "next-intl"

import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FigureCardProps {
  title: string
  type: "diagram" | "image"
  description?: string
  className?: string
}

export function FigureCard({
  title,
  type,
  description,
  className,
}: FigureCardProps) {
  const t = useTranslations("Report")
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4 ring-1 ring-neutral-700/50">
          <ImageIcon className="size-7 text-neutral-500" />
        </div>
        <p className="text-sm font-medium text-neutral-300 mb-1">{title}</p>
        <p className="text-xs text-neutral-500">
          {type === "diagram" ? t("conceptDiagram") : t("referenceImage")}
        </p>
        {description && (
          <p className="text-xs text-neutral-600 mt-3 text-center max-w-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/20 to-transparent pointer-events-none" />
    </div>
  )
}
