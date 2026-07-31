/**
 * Deterministic PRNG (mulberry32).
 *
 * Historical episodes are generated rather than hand-authored, but the
 * demo must render identically on every load and every machine, so the
 * generator is seeded and never uses Math.random.
 */
export function createRng(seed: number) {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,

    int(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min;
    },

    pick<T>(items: readonly T[]): T {
      return items[Math.floor(next() * items.length)];
    },

    /** Weighted pick. Weights need not sum to 1. */
    weighted<T>(entries: readonly [T, number][]): T {
      const total = entries.reduce((sum, [, w]) => sum + w, 0);
      let roll = next() * total;
      for (const [item, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return item;
      }
      return entries[entries.length - 1][0];
    },

    bool(probability: number): boolean {
      return next() < probability;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;
