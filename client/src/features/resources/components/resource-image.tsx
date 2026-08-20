"use client";

import React, { useState } from "react";
import type { PublicResource } from "../resources-types";
import { Download, ExternalLink, Maximize2, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceImageProps {
  resource: PublicResource;
}

export function ResourceImage({ resource }: ResourceImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resource.file_url) return;

    try {
      const response = await fetch(resource.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename =
        resource.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .concat(
            resource.file_url.includes(".svg")
              ? ".svg"
              : resource.file_url.includes(".png")
                ? ".png"
                : ".jpg",
          ) || "recurso-descarga";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(resource.file_url, "_blank", "noopener,noreferrer");
    }
  };

  if (imageError || !resource.file_url) {
    return null;
  }

  return (
    <>
      <figure
        className="group relative my-8 overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-all hover:border-border hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Type Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-border/40 bg-background/80 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {resource.type || "IMAGEN"}
        </div>

        {/* Action Controls Overlay */}
        <div
          className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => setIsFullscreen(true)}
            className="size-8 rounded-full bg-background/85 shadow-sm backdrop-blur-md hover:bg-background"
            title="Ver imagen completa"
            aria-label="Ver imagen completa"
          >
            <Maximize2 className="size-3.5 text-foreground/80" />
          </Button>

          {resource.downloadable && (
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={handleDownload}
              className="size-8 rounded-full bg-background/85 shadow-sm backdrop-blur-md hover:bg-background"
              title="Descargar archivo"
              aria-label="Descargar archivo"
            >
              <Download className="size-3.5 text-foreground/80" />
            </Button>
          )}
        </div>

        {/* Main Image Container */}
        <div
          className="relative flex items-center justify-center p-4 sm:p-6 cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <img
            src={resource.file_url}
            alt={resource.alt_text || resource.title || "Figura de la sección"}
            loading="lazy"
            onError={() => setImageError(true)}
            className="max-h-[480px] w-auto max-w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>

        {/* Caption */}
        {(resource.title || resource.description) && (
          <figcaption className="border-t border-border/40 bg-background/50 px-4 py-3 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm">
            {resource.title && (
              <p className="font-semibold text-foreground tracking-tight">
                {resource.title}
              </p>
            )}
            {resource.description && (
              <p className="mt-0.5 text-muted-foreground/90 leading-relaxed">
                {resource.description}
              </p>
            )}
          </figcaption>
        )}
      </figure>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-h-[92vh] max-w-[92vw] flex flex-col items-center">
            {/* Top Toolbar */}
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              {resource.downloadable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="size-4" />
                  <span>Descargar</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
                className="size-9 rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Cerrar modal"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Modal Image */}
            <img
              src={resource.file_url}
              alt={resource.alt_text || resource.title || "Figura"}
              className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Modal Caption */}
            {resource.title && (
              <div
                className="mt-3 max-w-xl text-center text-sm text-white/90"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="font-semibold">{resource.title}</p>
                {resource.description && (
                  <p className="mt-0.5 text-xs text-white/70">
                    {resource.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
