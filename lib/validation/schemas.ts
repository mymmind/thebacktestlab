import { z } from "zod";

import { TIMEFRAMES } from "@/lib/candles/candle-types";

export const timeframeSchema = z.enum(TIMEFRAMES);

export const candleRowSchema = z
  .object({
    timestamp: z.union([
      z.number().int().positive(),
      z.string().min(1),
    ]),
    open: z.coerce.number().finite(),
    high: z.coerce.number().finite(),
    low: z.coerce.number().finite(),
    close: z.coerce.number().finite(),
    volume: z.coerce.number().finite().nonnegative().optional(),
  })
  .superRefine((row, ctx) => {
    if (row.high < row.low) {
      ctx.addIssue({
        code: "custom",
        message: "high must be >= low",
        path: ["high"],
      });
    }

    if (row.open < row.low || row.open > row.high) {
      ctx.addIssue({
        code: "custom",
        message: "open must be within [low, high]",
        path: ["open"],
      });
    }

    if (row.close < row.low || row.close > row.high) {
      ctx.addIssue({
        code: "custom",
        message: "close must be within [low, high]",
        path: ["close"],
      });
    }
  });

export const candleSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(1),
  timeframe: timeframeSchema,
  timestamp: z.number().int().positive(),
  open: z.number().finite(),
  high: z.number().finite(),
  low: z.number().finite(),
  close: z.number().finite(),
  volume: z.number().finite().nonnegative().optional(),
});

export type CandleRowInput = z.input<typeof candleRowSchema>;
export type CandleRow = z.output<typeof candleRowSchema>;
