#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public", "sample-data");

const SYMBOLS = [
  { symbol: "EURUSD", startPrice: 1.087, volatility: 0.00015, volumeBase: 120 },
  { symbol: "GBPUSD", startPrice: 1.268, volatility: 0.0002, volumeBase: 95 },
  { symbol: "XAUUSD", startPrice: 2034.5, volatility: 0.35, volumeBase: 45 },
];

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function generateM1Csv(config, rowCount, seed) {
  const rand = seededRandom(seed);
  const startMs = Date.parse("2024-01-15T09:00:00.000Z");
  const lines = ["timestamp,open,high,low,close,volume"];

  let price = config.startPrice;

  for (let i = 0; i < rowCount; i += 1) {
    const timestamp = new Date(startMs + i * 60_000).toISOString();
    const drift = (rand() - 0.5) * config.volatility * 2;
    const open = Number(price.toFixed(config.symbol === "XAUUSD" ? 2 : 5));
    price += drift;
    const close = Number(price.toFixed(config.symbol === "XAUUSD" ? 2 : 5));
    const wick = config.volatility * (0.5 + rand());
    const high = Number(
      Math.max(open, close, open + wick, close + wick).toFixed(
        config.symbol === "XAUUSD" ? 2 : 5,
      ),
    );
    const low = Number(
      Math.min(open, close, open - wick, close - wick).toFixed(
        config.symbol === "XAUUSD" ? 2 : 5,
      ),
    );
    const volume = Math.round(config.volumeBase + rand() * config.volumeBase);

    lines.push(`${timestamp},${open},${high},${low},${close},${volume}`);
  }

  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(PUBLIC_DIR, { recursive: true });

for (const [index, config] of SYMBOLS.entries()) {
  const csv = generateM1Csv(config, 240, 1000 + index * 137);
  const filePath = path.join(PUBLIC_DIR, `${config.symbol}_M1_sample.csv`);
  fs.writeFileSync(filePath, csv, "utf8");
  console.log(`Wrote ${filePath} (${240} rows)`);
}
