"use client";

import { exportCurrentState, importState, resetAllState } from "@/store/persistence-store";
import { Button } from "@/components/ui/button";

export function ImportExportPanel() {
  function handleExport() {
    const json = exportCurrentState();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "backtesting-lab-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        importState(reader.result);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="section-card" data-testid="import-export-panel">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Data Backup
      </h3>

      <Button
        type="button"
        className="w-full"
        data-testid="export-button"
        onClick={handleExport}
      >
        Export JSON
      </Button>

      <label className="block space-y-1.5 text-[11px]">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Import JSON
        </span>
        <input
          type="file"
          accept="application/json,.json"
          aria-label="Import JSON backup"
          className="block w-full text-[11px] text-muted-foreground file:mr-3 file:border file:border-border file:bg-background file:px-2 file:py-1 file:font-mono file:text-[10px] file:uppercase file:text-foreground"
          data-testid="import-input"
          onChange={handleImport}
        />
      </label>

      <Button
        type="button"
        variant="destructive"
        className="w-full"
        data-testid="reset-button"
        onClick={() => resetAllState()}
      >
        Reset all local data
      </Button>
    </div>
  );
}
