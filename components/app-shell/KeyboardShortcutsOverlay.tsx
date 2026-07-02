"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";

const SHORTCUT_GROUPS = [
  {
    title: "Replay",
    shortcuts: [
      { keys: ["←"], action: "Previous candle" },
      { keys: ["→"], action: "Next candle" },
      { keys: ["Shift", "←"], action: "Rewind 10 candles" },
      { keys: ["Shift", "→"], action: "Advance 10 candles" },
      { keys: ["Space"], action: "Play / pause" },
    ],
  },
  {
    title: "Trading",
    shortcuts: [
      { keys: ["L"], action: "Open long ticket" },
      { keys: ["S"], action: "Open short ticket" },
      { keys: ["Enter"], action: "Confirm ticket" },
      { keys: ["Esc"], action: "Cancel ticket" },
      { keys: ["X"], action: "Close open trade" },
    ],
  },
  {
    title: "Interface",
    shortcuts: [{ keys: ["?"], action: "Toggle shortcuts overlay" }],
  },
] as const;

type KeyboardShortcutsOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function KeyboardShortcutsOverlay({
  open,
  onClose,
}: KeyboardShortcutsOverlayProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "?") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      data-testid="keyboard-shortcuts-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div
        className="panel-frame w-full max-w-lg animate-panel-in bg-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <h2 className="panel-header-title text-foreground">Keyboard Shortcuts</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close shortcuts overlay"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 p-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <li
                    key={shortcut.action}
                    className="flex items-center justify-between gap-4 text-xs"
                  >
                    <span className="text-muted-foreground">{shortcut.action}</span>
                    <span className="flex items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <span key={`${shortcut.action}-${key}`} className="flex items-center gap-1">
                          {index > 0 ? (
                            <span className="text-[10px] text-muted-foreground">+</span>
                          ) : null}
                          <Kbd>{key}</Kbd>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />
        <p className="px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          Press <Kbd className="mx-1">?</Kbd> or <Kbd className="mx-1">Esc</Kbd> to close
        </p>
      </div>
    </div>
  );
}
