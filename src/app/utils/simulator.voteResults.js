// simulator.voteResults.js
import { voting } from "./simulator.voting";

/**
 * Runs a voting pass and returns raw voter→target pairs.
 * NOTE: this still uses your existing `voting(tribe, merged)` call signature.
 */
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

/**
 * Given vote objects and tribes, return the index of the voted-out player.
 * (Searches tribe 1, then tribe 2.)
 */
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

  const idx0 = tribes[0].findIndex((player) => player.name === votedOut);
  if (idx0 !== -1) return idx0;

  return tribes[1].findIndex((player) => player.name === votedOut);
};
