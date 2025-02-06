/**
 * Selects a random integer between 0 and max - 1.
 * @param {number} max - The maximum value (exclusive).
 * @returns {number} A random integer.
 */
const getRandomInt = (max) => Math.floor(Math.random() * max);

export const getVoteResults = (tribe, merged) => {
  let votes = [];
  let voteCounts = {};

  tribe.forEach((player) => {
    const targetIndex = voting(tribe, merged);
    const targetPlayer = tribe[targetIndex];

    votes.push({ voter: player.name, target: targetPlayer.name });

    voteCounts[targetIndex] = (voteCounts[targetIndex] || 0) + 1;
  });

  return votes;
};

export const determineVotedOut = (votes, tribes) => {
  let voteCounts = {};

  votes.forEach(({ target }) => {
    voteCounts[target] = (voteCounts[target] || 0) + 1;
  });

  let maxVotes = 0;
  let votedOut = null;

  Object.entries(voteCounts).forEach(([name, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      votedOut = name;
    }
  });

  return tribes[0].findIndex(player => player.name === votedOut) ?? tribes[1].findIndex(player => player.name === votedOut);
};

/**
 * Voting logic for a tribe during the simulation.
 * @param {Array} tribe - Array of players in the tribe.
 * @param {boolean} merged - Whether the tribe is in a merged state.
 * @returns {number} The index of the voted-out player.
 */
export const voting = (tribe, merged, winner) => {
  const votes = {};
  const voteDetails = [];

  tribe.forEach((player, voterIndex) => {
    if (!player) return;

    const choices = [];
    tribe.forEach((other, i) => {
      if (i === voterIndex || i === winner) return;

      let weight = 0;

      if (!merged) {
        weight += 10 - other.premerge;
        weight += 10 - other.likeability;
        weight += other.threat;
        weight += 10 - other.strategicness;
      } else {
        weight += Math.pow(other.postmerge, 2);
        weight += Math.pow(other.threat, 2);
        weight += tribe.length > 6 ? 10 - other.likeability : other.likeability;
        weight += 10 - other.strategicness;
      }

      const relationshipScore = player.relationships?.[other.name] || 0;
      weight -= relationshipScore;

      for (let n = 0; n < weight; n++) {
        choices.push(i);
      }
    });

    const voteIndex = choices[getRandomInt(choices.length)];
    votes[voteIndex] = (votes[voteIndex] || 0) + 1;
    voteDetails.push(`${player.name} voted for ${tribe[voteIndex].name}`);
  });

  const [loser] = Object.entries(votes).reduce((acc, curr) =>
    curr[1] > acc[1] ? curr : acc
  );
  return { voteIndex: parseInt(loser), voteDetails };
};

/**
 * Determines the winner of the final vote.
 * @param {Array} finalThree - Array of final three players.
 * @param {Array} jury - Array of jury members.
 * @returns {Object} The sole survivor (winner).
 */
export const votingWinner = (finalThree, jury) => {
  const choices = [];
  finalThree.forEach((player, i) => {
    player.voteCount = 0;
    for (let n = 0; n < player.likeability; n++) choices.push(i);
    for (let n = 0; n < player.strategicness; n++) choices.push(i);
  });

  jury.forEach(() => {
    const vote = choices[getRandomInt(choices.length)];
    finalThree[vote].voteCount++;
  });

  finalThree.sort((a, b) => b.voteCount - a.voteCount);

  const soleSurvivor = finalThree[0];
  soleSurvivor.placement = 1;
  finalThree[1].placement = 2;
  finalThree[2].placement = 3;

  return soleSurvivor;
};

/**
 * Determines the individual immunity winner.
 * @param {Array} tribe - Array of players in the tribe.
 * @returns {number} The index of the immunity winner.
 */
export const individualImmunity = (tribe) => {
  const choices = [];
  tribe.forEach((player, i) => {
    for (let j = 0; j < player.postmerge; j++) choices.push(i);
  });
  return choices[getRandomInt(choices.length)];
};

/**
 * Determines which tribe wins tribal immunity.
 * @param {Array} tribes - Array of two tribes.
 * @returns {number} The index of the winning tribe.
 */
export const tribalImmunity = (tribes) => {
  const total = Math.min(tribes[0].length, tribes[1].length);

  tribes[0].sort((a, b) => b.premerge - a.premerge);
  tribes[1].sort((a, b) => b.premerge - a.premerge);

  let score0 = 0;
  let score1 = 0;
  for (let i = 0; i < total; i++) {
    score0 += tribes[0][i].premerge;
    score1 += tribes[1][i].premerge;
  }

  const choices = [];
  for (let i = 0; i < score0; i++) choices.push(0);
  for (let i = 0; i < score1; i++) choices.push(1);

  return choices[getRandomInt(choices.length)];
};
