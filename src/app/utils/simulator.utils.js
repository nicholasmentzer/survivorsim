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

/** Build per-vote reveal order (no idols) */
export const generateVotingSummary = (votes, tribe) => {
  let voteCounts = {};
  let voteOrder = [];

  votes.forEach(({ target }) => {
    voteCounts[target] = (voteCounts[target] || 0) + 1;
  });

  let sortedCandidates = Object.entries(voteCounts).map(([name]) => name);

  // We mutate a copy of votes at call-site, so this is fine
  while (votes.length > 0) {
    for (let i = 0; i < sortedCandidates.length; i++) {
      let candidate = sortedCandidates[i];
      let voteIndex = votes.findIndex((vote) => vote.target === candidate);

      if (voteIndex !== -1) {
        voteOrder.push(votes.splice(voteIndex, 1)[0]);
      }

      if (votes.length === 0) break;
    }
  }

  return voteOrder.map((vote, index) => {
    let player = tribe.find((p) => p.name === vote.target);
    const n = index + 1;
    return `
      <div class="flex flex-col items-center space-x-3">
        <img src="${player.image}" alt="${vote.target}" class="mb-2 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600">
        <p>${n}${getOrdinalSuffix(n)} vote: ${vote.target}</p>
      </div>
    `;
  });
};

/** Build reveal order when an idol is played */
export const generateVotingSummaryWithIdol = (votes, immunePlayer, tribe) => {
  let voteCounts = {};
  let voteOrder = [];
  let immuneVotes = [];
  let validVotes = [];

  votes.forEach(({ target }) => {
    if (target === immunePlayer) {
      immuneVotes.push(target);
    } else {
      voteCounts[target] = (voteCounts[target] || 0) + 1;
      validVotes.push(target);
    }
  });

  let sortedCandidates = Object.entries(voteCounts).map(([name]) => name);

  immuneVotes.forEach((target) => {
    voteOrder.push({ target, immune: true });
  });

  while (validVotes.length > 0) {
    for (let i = 0; i < sortedCandidates.length; i++) {
      let candidate = sortedCandidates[i];
      let voteIndex = validVotes.findIndex((vote) => vote === candidate);

      if (voteIndex !== -1) {
        voteOrder.push({
          target: validVotes.splice(voteIndex, 1)[0],
          immune: false,
        });
      }

      if (validVotes.length === 0) break;
    }
  }

  return voteOrder.map((vote, index) => {
    let player = tribe.find((p) => p.name === vote.target);
    const n = index + 1;

    if (vote.immune) {
      return `
        <div class="flex flex-col items-center space-x-3">
          <img src="${player.image}" alt="${vote.target}" class="mb-2 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600">
          <p>${n}${getOrdinalSuffix(n)} vote: ${vote.target} <span class="text-red-500">DOES NOT COUNT</span></p>
        </div>
      `;
    }

    return `
      <div class="flex flex-col items-center space-x-3">
        <img src="${player.image}" alt="${vote.target}" class="mb-2 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600">
        <p>${n}${getOrdinalSuffix(n)} vote: ${vote.target}</p>
      </div>
    `;
  });
};
