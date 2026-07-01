import type { ReplayEngineState } from "@/lib/replay/replay-engine";

type ReplayStateReader = () => ReplayEngineState;

let readReplayState: ReplayStateReader | null = null;

export function registerReplayStateReader(reader: ReplayStateReader): void {
  readReplayState = reader;
}

export function getReplayEngineState(): ReplayEngineState {
  if (!readReplayState) {
    throw new Error("Replay store is not initialized");
  }

  return readReplayState();
}
