"use client";

import { exportCurrentState, importState, resetAllState } from "@/store/persistence-store";

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
    <div className="space-y-3 border-2 border-border p-4" data-testid="import-export-panel">
      <h3 className="text-xs font-bold uppercase tracking-widest">
        Backup
      </h3>
      <button
        type="button"
        className="w-full border-2 border-foreground px-3 py-2 text-xs font-bold uppercase"
        data-testid="export-button"
        onClick={handleExport}
      >
        Export JSON
      </button>
      <label className="block text-xs">
        <span className="mb-1 block text-muted-foreground">Import JSON</span>
        <input
          type="file"
          accept="application/json,.json"
          aria-label="Import JSON backup"
          data-testid="import-input"
          onChange={handleImport}
        />
      </label>
      <button
        type="button"
        className="w-full border-2 border-destructive px-3 py-2 text-xs uppercase text-destructive"
        data-testid="reset-button"
        onClick={() => resetAllState()}
      >
        Reset all local data
      </button>
    </div>
  );
}
