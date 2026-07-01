"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { useCandleContext } from "@/components/app-shell/CandleProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ReplayControls() {
  const {
    stepBackward,
    stepForward,
    togglePlayPause,
    pauseReplay,
    status,
    speed,
    isLoading,
  } = useCandleContext();

  const isPlaying = status === "playing";

  return (
    <footer
      aria-label="Replay controls"
      className="flex h-14 shrink-0 items-center gap-3 border-t-2 border-border bg-card px-4"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Replay
      </span>
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous candle"
          data-testid="replay-previous"
          disabled={isLoading}
          onClick={() => stepBackward()}
        >
          <SkipBack className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next candle"
          data-testid="replay-next"
          disabled={isLoading}
          onClick={() => stepForward()}
        >
          <SkipForward className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Play"
          data-testid="replay-play"
          disabled={isLoading || isPlaying}
          onClick={togglePlayPause}
        >
          <Play className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Pause"
          data-testid="replay-pause"
          disabled={isLoading || !isPlaying}
          onClick={pauseReplay}
        >
          <Pause className="size-4" />
        </Button>
      </div>
      <Separator orientation="vertical" className="h-6" />
      <span className="text-xs text-muted-foreground" data-testid="replay-speed">
        Speed: {speed}
      </span>
      <span className="sr-only" data-testid="replay-status">
        {status}
      </span>
    </footer>
  );
}
