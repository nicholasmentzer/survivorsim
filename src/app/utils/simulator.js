/**
 * Selects a random integer between 0 and max - 1.
 * @param {number} max - The maximum value (exclusive).
 * @returns {number} A random integer.
 */
const getRandomInt = (max) => Math.floor(Math.random() * max);

/**
 * Voting logic for a tribe during the simulation.
 * @param {Array} tribe - Array of players in the tribe.
 * @param {boolean} merged - Whether the tribe is in a merged state.
 * @returns {number} The index of the voted-out player.
 */
export const voting = (tribe, merged) => {
    const choices = [];
    if (!merged) {
      tribe.forEach((player, i) => {
        if (!player) return; // Skip undefined players
        for (let n = 0; n < 10 - player.premerge; n++) choices.push(i);
        for (let n = 0; n < 10 - player.likeability; n++) choices.push(i);
        for (let n = 0; n < player.threat; n++) choices.push(i);
        for (let n = 0; n < 10 - player.strategicness; n++) choices.push(i);
      });
    } else {
      tribe.forEach((player, i) => {
        if (!player) return; // Skip undefined players
        const premergeExp = Math.pow(player.postmerge, 2);
        for (let n = 0; n < premergeExp; n++) choices.push(i);
  
        const threatExp = Math.pow(player.threat, 2);
        for (let n = 0; n < threatExp; n++) choices.push(i);
  
        if (tribe.length > 6) {
          for (let n = 0; n < 10 - player.likeability; n++) choices.push(i);
        } else {
          for (let n = 0; n < player.likeability; n++) choices.push(i);
        }
  
        for (let n = 0; n < 10 - player.strategicness; n++) choices.push(i);
      });
    }
    // Select a random player index from the choices
    const voteIndex = choices[getRandomInt(choices.length)];
    console.log(voteIndex);
    return voteIndex; // Return the actual player object
  };

/**
 * Determines the winner of the final vote.
 * @param {Array} finalThree - Array of final three players.
 * @param {Array} jury - Array of jury members.
 * @returns {Object} The sole survivor (winner).
 */
export const votingWinner = (finalThree, jury, totalSims) => {
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

  finalThree.forEach((player) => {
    player.sumplace += player.placement;
    player.avgplace = player.sumplace / totalSims;
  });

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
