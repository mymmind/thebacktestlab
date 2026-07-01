"use client";

import { useEffect } from "react";

import { useCandleContext } from "@/components/app-shell/CandleProvider";

export function ReplayKeyboardHandler() {
  const { stepForward, stepBackward, togglePlayPause, isLoading } =
    useCandleContext();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isLoading) {
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
        return;
      }

      if (event.key === "ArrowRight" && event.shiftKey) {
        event.preventDefault();
        stepForward(10);
        return;
      }

      if (event.key === "ArrowLeft" && event.shiftKey) {
        event.preventDefault();
        stepBackward(10);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepForward();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepBackward();
        return;
      }

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, stepBackward, stepForward, togglePlayPause]);

  return null;
}
