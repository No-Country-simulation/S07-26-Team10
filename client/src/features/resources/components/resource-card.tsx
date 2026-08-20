"use client";

import React, { useState } from "react";
import type { PublicResource } from "../resources-types";
import {
  FileText,
  FileSpreadsheet,
  Download,
  ExternalLink,
  File,
  Check,
  Loader2,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceCardProps {
  resource: PublicResource;
}

function getFileIcon(type: string, url: string) {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (type === "PDF" || ext === "pdf") {
    return <FileText className="size-5 text-red-500" />;
  }
  if (["csv", "xlsx", "xls", "json"].includes(ext) || type === "DATASET") {
    return <FileSpreadsheet className="size-5 text-emerald-500" />;
  }
  if (["svg", "xml", "html", "md"].includes(ext)) {
    return <FileCode className="size-5 text-sky-500" />;
  }
  return <File className="size-5 text-amber-500" />;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!resource.file_url) return;

    setDownloading(true);
    try {
      const response = await fetch(resource.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const ext = resource.file_url.split(".").pop()?.split("?")[0] || "file";
      const filename =
        resource.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .concat(`.${ext}`) || `recurso.${ext}`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      window.open(resource.file_url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="p-2.5 rounded-lg bg-muted/60 border border-border/40 shrink-0 group-hover:scale-105 transition-transform">
          {getFileIcon(resource.type, resource.file_url)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {resource.title}
            </h4>
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono uppercase bg-muted text-muted-foreground border border-border/40">
              {resource.type}
            </span>
          </div>

          {resource.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {resource.downloadable ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="gap-1.5 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/80"
          >
            {downloading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Descargando...</span>
              </>
            ) : downloaded ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span>Listo</span>
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                <span>Descargar</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            render={
              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="gap-1.5 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/80"
          >
            <ExternalLink className="size-3.5" />
            <span>Ver archivo</span>
          </Button>
        )}
      </div>
    </div>
  );
}
