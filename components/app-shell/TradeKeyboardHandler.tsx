"use client";

import { useEffect } from "react";

import { useCandleContext } from "@/components/app-shell/CandleProvider";
import { useOpenTrade, useTradeStore } from "@/store/trade-store";

export function TradeKeyboardHandler() {
  const { currentCandle, isLoading } = useCandleContext();
  const draft = useTradeStore((state) => state.draft);
  const startDraft = useTradeStore((state) => state.startDraft);
  const confirmDraft = useTradeStore((state) => state.confirmDraft);
  const cancelDraft = useTradeStore((state) => state.cancelDraft);
  const updateDraft = useTradeStore((state) => state.updateDraft);
  const closeOpenTrade = useTradeStore((state) => state.closeOpenTrade);
  const openTrade = useOpenTrade();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isLoading || !currentCandle) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        if (event.key !== "Escape" && event.key !== "Enter") {
          return;
        }
      }

      if (event.key === "l" || event.key === "L") {
        if (!draft && !openTrade) {
          event.preventDefault();
          startDraft("long", currentCandle.close);
        }
        return;
      }

      if (event.key === "s" || event.key === "S") {
        if (!draft && !openTrade) {
          event.preventDefault();
          startDraft("short", currentCandle.close);
        }
        return;
      }

      if (event.key === "Enter" && draft) {
        event.preventDefault();
        confirmDraft();
        return;
      }

      if (event.key === "Escape" && draft) {
        event.preventDefault();
        cancelDraft();
        return;
      }

      if ((event.key === "x" || event.key === "X") && openTrade) {
        event.preventDefault();
        closeOpenTrade();
        return;
      }

      if (draft) {
        if (event.key === "b" || event.key === "B") {
          updateDraft({});
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cancelDraft,
    closeOpenTrade,
    confirmDraft,
    currentCandle,
    draft,
    isLoading,
    openTrade,
    startDraft,
    updateDraft,
  ]);

  return null;
}
