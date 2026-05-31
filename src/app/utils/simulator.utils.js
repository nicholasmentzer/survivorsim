// simulator.utils.js

/** Random int in [0, max) */
export const getRandomInt = (max) => Math.floor(Math.random() * max);

/** 1st / 2nd / 3rd / 4th etc */
export const getOrdinalSuffix = (num) => {
  if (num % 10 === 1 && num % 100 !== 11) return "st";
  if (num % 10 === 2 && num % 100 !== 12) return "nd";
  if (num % 10 === 3 && num % 100 !== 13) return "rd";
  return "th";
};

/** Turn [[index, count], ...] into "3-2-1" style string */
export const generateFormattedVotes = (votes) =>
  votes.map(([_, count]) => `${count}`).join("-");

// ---------------------------------------------------------------------------
// Dramatic vote-reveal ordering
// ---------------------------------------------------------------------------

/**
 * Style functions: weight for revealing a vote for `target` at a given step.
 * Higher = more likely next. Always returns > 0.
 * Signature: (target, boot, revealedCounts, remainingCounts, totalCounts) => number
 */
const VOTE_ORDER_STYLES = [
  // 0: Boot-last — save boot's votes for a dramatic late sweep
  (target, boot) =>
    target === boot ? 0.12 : 1.0,

  // 1: Boot-first — boot shows dominance early, minority defiance at the end
  (target, boot) =>
    target === boot ? 3.5 : 0.6,

  // 2: Trailing-bias — prefer whoever is currently behind in revealed count
  (target, _boot, rev) => {
    const maxRev = Math.max(0, ...Object.values(rev));
    return Math.max(0.1, maxRev - (rev[target] || 0) + 1);
  },

  // 3: Cluster ascending — read smallest total-vote groups first, biggest last
  (target, _boot, _rev, _rem, total) =>
    Math.max(0.1, 1.0 / (total[target] + 0.5)),

  // 4: Cluster descending — read biggest group first, smallest last
  (target, _boot, _rev, _rem, total) =>
    Math.max(0.1, total[target]),

  // 5: Suspense build — keep it close through ~55%, then let boot sweep
  (target, boot, rev, _rem, total) => {
    const revTotal = Object.values(rev).reduce((a, b) => a + b, 0);
    const grandTotal = Object.values(total).reduce((a, b) => a + b, 0);
    if (revTotal / grandTotal < 0.55) {
      const maxRev = Math.max(0, ...Object.values(rev));
      return Math.max(0.1, maxRev - (rev[target] || 0) + 1);
    }
    return target === boot ? 3.0 : 0.5;
  },

  // 6: Comeback — boot builds early lead, minority surges, boot closes out
  (target, boot, rev) => {
    const bootRev = rev[boot] || 0;
    const maxOtherRev = Math.max(
      0,
      ...Object.entries(rev).filter(([t]) => t !== boot).map(([, c]) => c)
    );
    if (bootRev <= maxOtherRev) {
      return target === boot ? 2.5 : 0.4;
    }
    return target === boot ? 0.25 : 2.5;
  },

];

/** Weighted random index pick */
const weightedPick = (weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
};

/**
 * Builds a dramatically varied reveal sequence.
 * Constraint: no candidate may be "doomed" (their count exceeds max reachable
 * by any other candidate) while other candidates still have unrevealed votes.
 */
const buildDramaticOrder = (votes) => {
  if (votes.length === 0) return [];

  const totalCounts = {};
  votes.forEach((v) => {
    totalCounts[v.target] = (totalCounts[v.target] || 0) + 1;
  });

  const revealedCounts = {};
  const remainingCounts = { ...totalCounts };
  Object.keys(totalCounts).forEach((t) => { revealedCounts[t] = 0; });

  const boot = Object.entries(totalCounts).sort((a, b) => b[1] - a[1])[0][0];
  const styleFn = VOTE_ORDER_STYLES[Math.floor(Math.random() * VOTE_ORDER_STYLES.length)];

  const pool = [...votes];
  const sequence = [];

  while (pool.length > 0) {
    const allTargets = [...new Set(pool.map((v) => v.target))];

    const eligibleTargets = allTargets.filter((t) => {
      const newCount = revealedCounts[t] + 1;
      const othersHaveRemaining = Object.entries(remainingCounts).some(
        ([other, cnt]) => other !== t && cnt > 0
      );
      if (!othersHaveRemaining) return true;
      const maxOtherPossible = Math.max(
        ...Object.entries(totalCounts)
          .filter(([other]) => other !== t)
          .map(([other]) => revealedCounts[other] + remainingCounts[other])
      );
      return newCount <= maxOtherPossible;
    });

    const targets = eligibleTargets.length > 0 ? eligibleTargets : allTargets;
    const weights = targets.map((t) =>
      Math.max(0.01, styleFn(t, boot, { ...revealedCounts }, { ...remainingCounts }, totalCounts))
    );

    const chosenTarget = targets[weightedPick(weights)];
    const votesForTarget = pool.filter((v) => v.target === chosenTarget);
    const chosen = votesForTarget[Math.floor(Math.random() * votesForTarget.length)];

    sequence.push(chosen);
    revealedCounts[chosenTarget]++;
    remainingCounts[chosenTarget]--;
    pool.splice(pool.indexOf(chosen), 1);
  }

  return sequence;
};

/**
 * Builds a strict round-robin reveal sequence (alternates between candidates,
 * one vote each per pass — the "safe" predictable order used for revotes).
 */
const buildRoundRobinOrder = (votes) => {
  if (votes.length === 0) return [];

  const voteCounts = {};
  votes.forEach((v) => { voteCounts[v.target] = (voteCounts[v.target] || 0) + 1; });
  const candidates = Object.keys(voteCounts);

  const pool = [...votes];
  const sequence = [];

  while (pool.length > 0) {
    for (const candidate of candidates) {
      const idx = pool.findIndex((v) => v.target === candidate);
      if (idx !== -1) sequence.push(pool.splice(idx, 1)[0]);
      if (pool.length === 0) break;
    }
  }

  return sequence;
};

// ---------------------------------------------------------------------------
// Shared HTML builders
// ---------------------------------------------------------------------------

/** Renders a single vote entry (image + ordinal label + subtle tally).
 *  Images are stored as a name token (data-pimg) — never baked-in data URLs —
 *  and hydrated to a real <img src> at render time in EpisodeView. */
const voteHtml = (player, ordinal, suffix, tallyLabel = "") => `
  <div class="flex flex-col items-center space-x-3">
    <img data-pimg="${encodeURIComponent(player.name)}" alt="${player.name}" class="mb-2 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600">
    <p>${ordinal}${suffix} vote: ${player.name}${tallyLabel ? `<span class="text-stone-500 font-normal text-[10px] ml-1">${tallyLabel}</span>` : ""}</p>
  </div>
`;

/**
 * Renders votes from `voteOrder`, stopping at the "point of no return" —
 * the moment where even if every remaining unread vote went to a single
 * other candidate, they still couldn't surpass the current leader.
 *
 * Doom condition: revealedCounts[target] > maxOtherRevealed + remainingUnread
 *
 * @param {Array<{target:string,voter:string}>} voteOrder - ordered sequence
 * @param {Object} totalCounts - { candidateName: totalVotes }
 * @param {Array} tribe
 * @param {number} [ordinalOffset=0] - start ordinals after this many already shown
 * @returns {string[]} array of HTML strings
 */
const renderWithDoomStop = (voteOrder, totalCounts, tribe, ordinalOffset = 0, eliminationOrdinal = 1) => {
  const totalVotes = voteOrder.length;
  const thisOrdinalSuffix = getOrdinalSuffix(eliminationOrdinal);

  const revealedCounts = {};
  Object.keys(totalCounts).forEach((t) => { revealedCounts[t] = 0; });

  const html = [];

  for (let i = 0; i < voteOrder.length; i++) {
    const { target } = voteOrder[i];
    revealedCounts[target]++;
    const player = tribe.find((p) => p.name === target);
    const n = i + 1 + ordinalOffset;

    // Doom: revealed votes for target exceed what any single other person
    // could reach even if all remaining votes went to them
    const remainingUnread = totalVotes - (i + 1);
    const maxOtherRevealed = Math.max(
      0,
      ...Object.entries(revealedCounts)
        .filter(([t]) => t !== target)
        .map(([, c]) => c)
    );

    if (revealedCounts[target] > maxOtherRevealed + remainingUnread) {
      // This vote IS the announcement — show as a combined doom card
      const remainingForTarget = totalCounts[target] - revealedCounts[target];
      html.push(
        `<div class="text-center pb-2">` +
        `<p class="font-bold text-amber-300 text-sm tracking-widest uppercase mb-2">` +
        `The ${eliminationOrdinal}${thisOrdinalSuffix} person voted out:` +
        `</p>` +
        `<img data-pimg="${encodeURIComponent(target)}" alt="${target}" ` +
        `class="mx-auto mb-1 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-amber-400/50">` +
        `<p class="font-semibold text-white">${target}</p>` +
        (remainingForTarget > 0
          ? `<p class="text-stone-400 text-xs mt-1">(${remainingForTarget} more vote${remainingForTarget !== 1 ? "s" : ""} for ${target})</p>`
          : "") +
        `</div>`
      );
      break;
    } else {
      // Show "X votes left" only when the read is getting close to the end.
      // Threshold scales with total votes but caps at 4 to avoid spoiling drama early in large tribals.
      const showTally = remainingUnread > 0 &&
        remainingUnread <= Math.max(1, Math.min(6, Math.floor(totalVotes * 0.5)));
      const tallyLabel = showTally ? `· ${remainingUnread} vote${remainingUnread !== 1 ? "s" : ""} left` : "";
      html.push(voteHtml(player, n, getOrdinalSuffix(n), tallyLabel));
    }
  }

  return html;
};

// ---------------------------------------------------------------------------
// Public summary builders
// ---------------------------------------------------------------------------

/**
 * Build per-vote reveal order (no idols).
 * @param {Array<{target,voter}>} votes
 * @param {Array} tribe
 * @param {{ roundRobin?: boolean, eliminationOrdinal?: number }} [opts]
 */
export const generateVotingSummary = (votes, tribe, opts = {}) => {
  if (votes.length === 0) return [];

  const totalCounts = {};
  votes.forEach((v) => { totalCounts[v.target] = (totalCounts[v.target] || 0) + 1; });

  const voteOrder = opts.roundRobin
    ? buildRoundRobinOrder(votes)
    : buildDramaticOrder(votes);

  return renderWithDoomStop(voteOrder, totalCounts, tribe, 0, opts.eliminationOrdinal ?? 1);
};

/**
 * Build reveal order when an idol is played.
 * Immune votes always appear first (crossed out), then valid votes
 * in a dramatically ordered sequence with doom detection.
 */
export const generateVotingSummaryWithIdol = (votes, immunePlayer, tribe, eliminationOrdinal = 1) => {
  const immuneVotes = votes.filter((v) => v.target === immunePlayer);
  const validVotes = votes.filter((v) => v.target !== immunePlayer);

  const totalCounts = {};
  validVotes.forEach((v) => { totalCounts[v.target] = (totalCounts[v.target] || 0) + 1; });

  const orderedValid = buildDramaticOrder(validVotes);

  const html = [];

  // Immune votes first (read out then voided)
  immuneVotes.forEach((vote, idx) => {
    const n = idx + 1;
    html.push(`
      <div class="flex flex-col items-center space-x-3">
        <img data-pimg="${encodeURIComponent(vote.target)}" alt="${vote.target}" class="mb-2 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600">
        <p>${n}${getOrdinalSuffix(n)} vote: ${vote.target} <span class="text-red-500">DOES NOT COUNT</span></p>
      </div>
    `);
  });

  // Valid votes with doom detection; ordinals continue after the immune votes
  renderWithDoomStop(orderedValid, totalCounts, tribe, immuneVotes.length, eliminationOrdinal)
    .forEach((entry) => html.push(entry));

  return html;
};
