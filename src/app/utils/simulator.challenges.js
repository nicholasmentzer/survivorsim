// simulator.challenges.js
import { getRandomInt } from "./simulator.utils";

/** Individual immunity (post-merge) */
export const individualImmunity = (tribe) => {
  const choices = [];
  tribe.forEach((player, i) => {
    for (let j = 0; j < player.postmerge * 4; j++) choices.push(i);
  });
  return choices[getRandomInt(choices.length)];
};

// Track the last losing tribe index to reduce repeat losses
let lastLosingTribeIndex = null;

/** Pre-merge tribal immunity between two tribes */
export const tribalImmunity = (tribes) => {
  if (!tribes || tribes.length < 2) {
    lastLosingTribeIndex = null;
    return { winnerIndex: 0, loserIndex: 0, winnerIndices: [0] };
  }

  // More even + size-neutral challenge math:
  // - Use average premerge strength (so smaller tribes aren't inherently punished)
  // - Add a small random swing (so outcomes aren't too deterministic)
  // - Pick a LOSER with softened weights (reduces "disaster tribe" streaks)
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const getPremerge = (p) => clamp(Number(p?.premerge ?? 0), 0, 10);

  const avgStrength = (tribe) => {
    const members = (tribe || []).filter(Boolean);
    if (members.length === 0) return 0;
    const sum = members.reduce((acc, p) => acc + getPremerge(p), 0);
    return sum / members.length;
  };

  // Tunables (chosen to be "more even most of the time")
  const RANDOM_SWING = 0.6; // +/- to average strength
  const TEMPERATURE = 2.5;  // higher => flatter odds
  const BASE = 1.25;        // baseline chance so strong tribes can still lose
  const REPEAT_LOSS_PENALTY = 0.45; // Lower = less likely to lose again (0.5 = 50% less likely)

  const powers = tribes.map((tribe) => {
    const base = avgStrength(tribe);
    const swing = (Math.random() * 2 - 1) * RANDOM_SWING;
    return Math.max(0, base + swing);
  });

  const weightedPick = (weights) => {
    const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
    if (total <= 0) return 0;
    let r = getRandomInt(total);
    for (let i = 0; i < weights.length; i++) {
      r -= Math.max(0, weights[i]);
      if (r < 0) return i;
    }
    return 0;
  };

  // IMPORTANT: getRandomInt expects an integer max. If totals are < 1 or floats,
  // Math.floor(Math.random() * max) can become 0 every time.
  // So we convert weights to integers.
  const maxPower = Math.max(...powers);
  const rawLoserWeights = powers.map((p) => BASE + Math.exp((maxPower - p) / TEMPERATURE));
  let loserWeights = rawLoserWeights.map((w) => Math.max(1, Math.round(w * 1000)));

  // Apply penalty to last losing tribe to reduce repeat losses
  if (lastLosingTribeIndex !== null && tribes[lastLosingTribeIndex]) {
    loserWeights[lastLosingTribeIndex] = Math.round(loserWeights[lastLosingTribeIndex] * REPEAT_LOSS_PENALTY);
    // Ensure minimum weight of 1
    if (loserWeights[lastLosingTribeIndex] < 1) loserWeights[lastLosingTribeIndex] = 1;
  }

  const loserIndex = weightedPick(loserWeights);
  lastLosingTribeIndex = loserIndex;

  // Everyone except the loser is a "winner" (typical multi-tribe format).
  const winnerIndices = tribes
    .map((_, i) => i)
    .filter((i) => i !== loserIndex);

  // Keep a single winnerIndex for legacy callers (best-scoring non-loser).
  const bestWinnerIndex = winnerIndices.reduce((bestIdx, i) =>
    powers[i] > powers[bestIdx] ? i : bestIdx,
    winnerIndices[0] ?? 0
  );

  return { winnerIndex: bestWinnerIndex, loserIndex, winnerIndices };
};
