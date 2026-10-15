"use client";

import type { CustomsItemRecord } from "@odyssway/engine";
import { useState } from "react";
import { buildBorderCardLines, type BorderCardLabels } from "../lib/border-card";

/**
 * "Download border card": a one-page PDF of this row, built in the browser —
 * nothing is sent anywhere (AGENTS.md §10). jsPDF loads only on click.
 */
export default function BorderCardButton({
  row,
  labels,
  buttonLabel,
  fileName,
}: {
  row: CustomsItemRecord;
  labels: BorderCardLabels;
  buttonLabel: string;
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const { default: JsPDF } = await import("jspdf");
      const doc = new JsPDF({ unit: "pt", format: "a4" });
      const marginX = 48;
      const maxWidth = 500;
      const pageBottom = 790;
      let y = 56;
      const write = (text: string, size: number, style: "normal" | "bold", lead: number, indent = 0) => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        for (const wrapped of doc.splitTextToSize(text, maxWidth - indent) as string[]) {
          if (y > pageBottom) {
            doc.addPage();
            y = 56;
          }
          doc.text(wrapped, marginX + indent, y);
          y += lead;
        }
      };
      for (const line of buildBorderCardLines(row, labels)) {
        if (line.kind === "gap") y += 8;
        else if (line.kind === "title") write(line.text, 15, "bold", 20);
        else if (line.kind === "heading") write(line.text, 11, "bold", 15);
        else if (line.kind === "check") {
          doc.setDrawColor(90);
          doc.rect(marginX, y - 8, 8, 8);
          write(line.text, 10, "normal", 14, 14);
          y += 2;
        } else if (line.kind === "small") write(line.text, 8.5, "normal", 11);
        else write(line.text, 10, "normal", 14);
      }
      doc.save(fileName);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      data-testid="border-card-button"
      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M10 2a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42L9 11.6V3a1 1 0 0 1 1-1ZM4 15a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
      </svg>
      {buttonLabel}
    </button>
  );
}
