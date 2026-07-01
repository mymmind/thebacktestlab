import { describe, expect, it } from "vitest";

import {
  createDefaultPersistedState,
  parsePersistedState,
  serializeState,
} from "@/lib/storage/persistence-types";

describe("persistence", () => {
  it("round-trips persisted state", () => {
    const state = createDefaultPersistedState();
    const parsed = parsePersistedState(serializeState(state));
    expect(parsed.settings.accountBalance).toBe(200_000);
    expect(parsed.trades).toEqual([]);
  });

  it("rejects invalid backup", () => {
    expect(() => parsePersistedState("{}"))
      .toThrow(/Invalid backup format|Unsupported backup version/);
  });
});
