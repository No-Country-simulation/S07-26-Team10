"use client";

/**
 * Client-side download helpers for figure exports.
 * SVG/PNG are generated from the funnel data so every export carries
 * the mandatory "Source: PhysaFlow Stranded Capacity Index" attribution.
 */

export interface ExportRow {
  label: string;
  value: string;
}

function inlineSvg() {
  return {
    fill: "#08201a",
    barGrey: "#8a8f8c",
    barGreen: "#0a7a45",
    barDeep: "#00603A",
    gold: "#C9A961",
    text: "#f0ede4",
    muted: "#a8b8a0",
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build a standalone SVG string of the capacity funnel with attribution. */
export function buildFunnelSvg(rows: ExportRow[], sourceText: string): string {
  const s = inlineSvg();
  const W = 760;
  const stepH = 46;
  const gap = 18;
  const padTop = 48;
  const padBottom = 60;
  const H = padTop + rows.length * (stepH + gap) + padBottom;
  const barWidth = 560;
  const barX = 66;
  const lastIndex = rows.length - 1;

  const rects = rows
    .map((row, i) => {
      const pct = parseFloat(row.value.replace("%", ""));
      const w = Math.round((barWidth * pct) / 100);
      const x = barX + (barWidth - w) / 2;
      const y = padTop + i * (stepH + gap);
      const color =
        i === lastIndex
          ? s.barDeep
          : i === lastIndex - 1
            ? s.barGreen
            : s.barGrey;
      return `<rect x="${x}" y="${y}" width="${w}" height="${stepH}" rx="4" fill="${color}"/>
  <text x="${barX + barWidth + 14}" y="${y + stepH / 2 + 5}" font-size="14" fill="${s.gold}">${row.value}</text>
  <text x="${barX + barWidth - w - 14}" y="${y + stepH / 2 + 5}" text-anchor="end" font-size="13" fill="${s.text}">${escapeXml(row.label)}</text>`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">
  <rect width="${W}" height="${H}" fill="${s.fill}"/>
  <text x="40" y="24" font-size="11" letter-spacing="3" fill="${s.gold}">STRANDED CAPACITY FUNNEL</text>
  ${rects}
  <line x1="40" y1="${H - 44}" x2="${W - 40}" y2="${H - 44}" stroke="${s.gold}" stroke-opacity="0.4"/>
  <text x="40" y="${H - 22}" font-size="12" fill="${s.muted}">${escapeXml(sourceText)}</text>
</svg>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download the funnel as an SVG file. */
export function downloadFunnelSvg(rows: ExportRow[], sourceText: string) {
  const svg = buildFunnelSvg(rows, sourceText);
  downloadBlob(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    "physaflow-stranded-capacity-funnel.svg",
  );
}

/** Rasterize a generated SVG to a PNG and download it. */
export async function downloadFunnelPng(
  rows: ExportRow[],
  sourceText: string,
) {
  const svg = buildFunnelSvg(rows, sourceText);
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("SVG rasterization failed"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 1520;
  canvas.height = Math.round((img.height / img.width) * canvas.width);
  const ctx = canvas.getContext("2d");
  URL.revokeObjectURL(url);
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((b) => {
    if (b) downloadBlob(b, "physaflow-stranded-capacity-funnel.png");
  }, "image/png");
}

/** Download the funnel data as a CSV table. */
export function downloadFunnelCsv(rows: ExportRow[]) {
  const lines = [
    "Step,Value",
    ...rows.map((r) => `${csvEscape(r.label)},${r.value}`),
    "Source: PhysaFlow Stranded Capacity Index,",
  ];
  downloadBlob(
    new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }),
    "physaflow-stranded-capacity-funnel.csv",
  );
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}