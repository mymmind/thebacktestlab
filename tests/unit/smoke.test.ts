import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("smoke", () => {
  it("merges class names with cn()", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
  });
});
