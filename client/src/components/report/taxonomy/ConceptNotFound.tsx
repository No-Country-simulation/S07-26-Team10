"use client"

import { useTranslations } from "next-intl"

import { SearchX, ArrowLeft } from "lucide-react"

interface ConceptNotFoundProps {
  conceptId: string
  onBack?: () => void
}

export function ConceptNotFound({ conceptId, onBack }: ConceptNotFoundProps) {
  const t = useTranslations("Report")
  return (
    <div className="max-w-xl mx-auto py-20">
      <div className="flex flex-col items-center text-center">
        <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6 ring-1 ring-neutral-700/50">
          <SearchX className="size-7 text-neutral-500" />
        </div>

        <h2 className="text-xl font-semibold text-neutral-100 mb-2">
          {t("conceptNotFound")}
        </h2>

        <p className="text-sm text-neutral-400 leading-relaxed mb-2 max-w-sm">
          The concept <span className="text-neutral-300 font-mono text-xs bg-neutral-800 px-1.5 py-0.5 rounded">{conceptId}</span> does not exist in the current taxonomy.
        </p>

        <p className="text-xs text-neutral-600 mb-8">
          It may have been removed or the link may be incorrect.
        </p>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-300 bg-neutral-800/60 border border-neutral-700/50 hover:bg-neutral-700/60 hover:text-neutral-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500"
          >
            <ArrowLeft className="size-4" />
            {t("backToDefault")}
          </button>
        )}
      </div>
    </div>
  )
}
