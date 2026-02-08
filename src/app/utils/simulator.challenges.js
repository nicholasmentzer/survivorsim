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

/** Pre-merge tribal immunity between two tribes */
export const tribalImmunity = (tribes) => {
  if (!tribes || tribes.length < 2) {
    return { winnerIndex: 0, loserIndex: 0, winnerIndices: [0] };
  }

  const minLen = Math.min(...tribes.map((t) => (t || []).length));
  const scores = tribes.map((tribe) => {
    const sorted = [...(tribe || [])].sort((a, b) => (b.premerge ?? 0) - (a.premerge ?? 0));
    let score = 0;
    for (let i = 0; i < minLen; i++) score += sorted[i]?.premerge ?? 0;
    return Math.max(1, score);
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

  const maxScore = Math.max(...scores);

  // Pick the losing tribe with weights biased toward lower scores.
  const loserWeights = scores.map((s) => Math.max(1, maxScore + 1 - s));
  const loserIndex = weightedPick(loserWeights);

  // Everyone except the loser is a "winner" (typical multi-tribe format).
  const winnerIndices = tribes
    .map((_, i) => i)
    .filter((i) => i !== loserIndex);

  // Keep a single winnerIndex for legacy callers (best-scoring non-loser).
  const bestWinnerIndex = winnerIndices.reduce((bestIdx, i) =>
    scores[i] > scores[bestIdx] ? i : bestIdx,
    winnerIndices[0] ?? 0
  );

  return { winnerIndex: bestWinnerIndex, loserIndex, winnerIndices };
};
