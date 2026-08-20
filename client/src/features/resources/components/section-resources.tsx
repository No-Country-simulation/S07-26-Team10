import React from "react";
import type { PublicResource } from "../resources-types";
import { ResourceImage } from "./resource-image";
import { ResourceCard } from "./resource-card";
import { getPublicSectionResources } from "../resources-queries";
import { Layers, Paperclip } from "lucide-react";

interface SectionResourcesProps {
  sectionId?: string;
  initialResources?: PublicResource[];
}

function isVisualResource(res: PublicResource): boolean {
  const type = (res.type || "").toUpperCase();
  if (type === "IMAGE" || type === "GRAPH" || type === "DIAGRAM") {
    return true;
  }
  const url = (res.file_url || "").toLowerCase();
  return /\.(png|jpe?g|svg|webp|gif)($|\?)/i.test(url);
}

export async function SectionResources({
  sectionId,
  initialResources,
}: SectionResourcesProps) {
  let resources = initialResources;

  if (!resources && sectionId) {
    resources = await getPublicSectionResources(sectionId);
  }

  if (!resources || resources.length === 0) {
    return null;
  }

  const visualResources = resources.filter(isVisualResource);
  const documentResources = resources.filter((r) => !isVisualResource(r));

  return (
    <div className="section-resources-container my-12 pt-8 border-t border-border/40 space-y-10">
      {/* Visual Figures & Diagrams */}
      {visualResources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Figuras y Diagramas de la Sección ({visualResources.length})</span>
          </div>

          <div className="space-y-6">
            {visualResources.map((resource) => (
              <ResourceImage key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Downloadable Documents & Files */}
      {documentResources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            <Paperclip className="size-4 text-amber-600 dark:text-amber-400" />
            <span>Archivos y Recursos Adjuntos ({documentResources.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {documentResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
