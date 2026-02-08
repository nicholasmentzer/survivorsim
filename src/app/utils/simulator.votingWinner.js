// simulator.votingWinner.js
import { getRandomInt, getOrdinalSuffix } from "./simulator.utils";

/**
 * Final jury vote for the winner.
 */
export const votingWinner = (finalThree, jury) => {
  const choices = [];
  const voteDetails = [];
  const voteSummary = [];

  const getSuspenseRevealOrder = (counts) => {
    const remaining = (counts || []).map((c) => Math.max(0, Number(c) || 0));
    const revealed = remaining.map(() => 0);
    const order = [];

    const spread = (arr) => {
      if (!arr.length) return 0;
      let min = arr[0];
      let max = arr[0];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] < min) min = arr[i];
        if (arr[i] > max) max = arr[i];
      }
      return max - min;
    };

    let lastPick = null;

    while (remaining.some((c) => c > 0)) {
      const candidates = remaining
        .map((c, i) => ({ i, c }))
        .filter((x) => x.c > 0);

      if (candidates.length === 1) {
        const i = candidates[0].i;
        order.push(i);
        remaining[i]--;
        revealed[i]++;
        lastPick = i;
        continue;
      }

      let best = null;
      for (const { i } of candidates) {
        const nextRevealed = [...revealed];
        nextRevealed[i]++;

        // Keep the running tally tight to build suspense.
        const baseScore = spread(nextRevealed);

        // Mildly discourage repeats if other candidates exist.
        const repeatPenalty = i === lastPick ? 0.25 : 0;

        // Prefer choosing from candidates with more remaining votes (prevents
        // draining a smaller pile too early and keeps back-and-forth going).
        const remainingBias = -(remaining[i] * 0.001);

        const score = baseScore + repeatPenalty + remainingBias;

        if (!best || score < best.score) {
          best = { i, score };
        }
      }

      order.push(best.i);
      remaining[best.i]--;
      revealed[best.i]++;
      lastPick = best.i;
    }

    return order;
  };
  
  const finalists = [...(finalThree || [])];
  const jurors = [...(jury || [])];

  finalists.forEach((player, i) => {
    player.voteCount = 0;
    for (let n = 0; n < player.likeability; n++) choices.push(i);
    for (let n = 0; n < player.strategicness; n++) choices.push(i);
  });

  jurors.forEach((juror) => {
    const vote = choices[getRandomInt(choices.length)];
    finalists[vote].voteCount++;
    
    voteDetails.push(`${juror.name} voted for ${finalists[vote].name}`);
  });

  // Reveal votes in a suspenseful order (back-and-forth between finalists).
  const countsAfterJury = finalists.map((p) => p.voteCount || 0);
  const revealOrder = getSuspenseRevealOrder(countsAfterJury);
  revealOrder.forEach((finalistIndex, revealIndex) => {
    const finalist = finalists[finalistIndex];
    const n = revealIndex + 1;
    voteSummary.push(`
      <div class="flex flex-col items-center gap-2">
        <img src="${finalist.image}" alt="${finalist.name}" class="mb-1 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600">
        <p>${n}${getOrdinalSuffix(n)} vote: ${finalist.name}</p>
      </div>
    `);
  });

  finalThree.sort((a, b) => b.voteCount - a.voteCount);

  const highestVoteCount = finalThree[0].voteCount;
  const tiedPlayers = finalThree.filter(player => player.voteCount === highestVoteCount);

  if (tiedPlayers.length === 1) {
    const soleSurvivor = tiedPlayers[0];
    soleSurvivor.placement = 1;
    finalThree[1].placement = 2;
    finalThree[2].placement = 3;

    voteSummary.push(
      `<span class="font-bold text-md md:text-lg">${soleSurvivor.name} wins Survivor with a vote of ${finalThree[0].voteCount}-${finalThree[1].voteCount}-${finalThree[2].voteCount}!</span>`
    );
    return { winner: soleSurvivor, voteDetails, voteSummary };
  }

  if (tiedPlayers.length === 2) {
    const thirdFinalist = finalThree.find(player => !tiedPlayers.includes(player));

    if (thirdFinalist) {
      const decidingVote = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
      decidingVote.voteCount++;

      voteSummary.push(
        `<span class="font-bold text-md md:text-lg">It's a tie! ${thirdFinalist.name} casts the deciding vote for ${decidingVote.name}!</span>`
      );

      decidingVote.placement = 1;
      tiedPlayers.find(p => p !== decidingVote).placement = 2;
      thirdFinalist.placement = 3;

      return { winner: decidingVote, voteDetails, voteSummary };
    }
  }

  const rockWinner = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
  voteSummary.push(
    `<span class="font-bold text-md md:text-lg">All finalists are tied! ${rockWinner.name} wins Survivor by a firemaking challenge!</span>`
  );
  rockWinner.placement = 1;
  tiedPlayers.filter(p => p !== rockWinner)[0].placement = 2;
  tiedPlayers.filter(p => p !== rockWinner)[1].placement = 3;

  return { winner: rockWinner, voteDetails, voteSummary };
};