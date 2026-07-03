"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { useCandleContext } from "@/components/app-shell/CandleProvider";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type ReplayControlsProps = {
  onShowShortcuts?: () => void;
};

export function ReplayControls({ onShowShortcuts }: ReplayControlsProps) {
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
    <footer aria-label="Replay controls" className="control-deck h-14 w-full shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Replay
        </span>
        <Badge variant={isPlaying ? "active" : "outline"} className="hidden sm:inline-flex">
          {status}
        </Badge>
      </div>

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

      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      <div className="hidden items-center gap-2 sm:flex">
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <Kbd>Space</Kbd>
      </div>

      <Separator orientation="vertical" className="hidden h-6 md:block" />

      <span className="font-mono text-[11px] text-muted-foreground" data-testid="replay-speed">
        {speed}x
      </span>
      <span className="sr-only" data-testid="replay-status">
        {status}
      </span>

      {onShowShortcuts ? (
        <>
          <div className="ml-auto hidden lg:block" />
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto lg:ml-0"
            aria-label="Show keyboard shortcuts"
            onClick={onShowShortcuts}
          >
            <Kbd>?</Kbd>
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
        </>
      ) : null}
    </footer>
  );
}
