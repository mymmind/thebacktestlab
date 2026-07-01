export type EmotionalState =
  | "calm"
  | "rushed"
  | "frustrated"
  | "confident"
  | "bored";

export type TradeJournal = {
  tradeId: string;
  preTradeNote?: string;
  postTradeNote?: string;
  emotionalState?: EmotionalState;
  mistakeTags?: string[];
  setupQuality: 1 | 2 | 3 | 4 | 5;
  followedRules: boolean;
  updatedAt: number;
};

export function createEmptyJournal(tradeId: string): TradeJournal {
  return {
    tradeId,
    setupQuality: 3,
    followedRules: false,
    updatedAt: Date.now(),
  };
}
