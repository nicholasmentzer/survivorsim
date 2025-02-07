import { removeFromAlliance } from "./simulation";

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

const getOrdinalSuffix = (num) => {
  if (num % 10 === 1 && num % 100 !== 11) return "st";
  if (num % 10 === 2 && num % 100 !== 12) return "nd";
  if (num % 10 === 3 && num % 100 !== 13) return "rd";
  return "th";
};

const generateVotingSummary = (votes) => {
  let voteCounts = {};
  let voteOrder = [];

  votes.forEach(({ target }) => {
    voteCounts[target] = (voteCounts[target] || 0) + 1;
  });

  let sortedCandidates = Object.entries(voteCounts)
    .sort((a, b) => b[1] - a[1]) 
    .map(([name]) => name);

  while (votes.length > 0) {
    for (let i = 0; i < sortedCandidates.length; i++) {
      let candidate = sortedCandidates[i];
      let voteIndex = votes.findIndex(vote => vote.target === candidate);
      
      if (voteIndex !== -1) {
        voteOrder.push(votes.splice(voteIndex, 1)[0]);
      }

      if (votes.length === 0) break;
    }
  }

  return voteOrder.map((vote, index) => {
    return `${index + 1}${getOrdinalSuffix(index + 1)} vote: ${vote.target}`;
  });
};

/**
 * Voting logic for a tribe during the simulation.
 * @param {Array} tribe - Array of players in the tribe.
 * @param {boolean} merged - Whether the tribe is in a merged state.
 * @returns {number} The index of the voted-out player.
 */
export const voting = (tribe, alliances2, merged, immuneIndex) => {
  const votes = {};
  const exportVotes = [];
  const voteDetails = [];
  const voteSummary = [];
  voteDetails.push(`<span class="font-bold text-lg">Vote Summary</span>`);
  voteSummary.push(`<span class="font-bold text-lg">It's time to vote!</span>`);

  tribe.forEach((voter, voterIndex) => {
    if (!voter) return;

    let bestAlliance = null;
    let allianceOptions = [];

    alliances2.forEach(alliance => {
      if (alliance.members.includes(voter)) {
        let totalRelationship = 0;
        let numMembers = 0;
    
        alliance.members.forEach(other => {
          if (other !== voter) {
            totalRelationship += voter.relationships[other.name];
            numMembers++;
          }
        });
    
        let allianceStrength = totalRelationship / numMembers;
    
        allianceOptions.push({ alliance, strength: allianceStrength });
      }
    });
    
    if (allianceOptions.length > 0) {
      let totalStrength = allianceOptions.reduce((sum, option) => sum + option.strength, 0);
      let rand = Math.random() * totalStrength;
      let cumulative = 0;
    
      for (let option of allianceOptions) {
        cumulative += option.strength;
        if (rand <= cumulative) {
          bestAlliance = option.alliance;
          break;
        }
      }
    }

    let target = null;

    if (bestAlliance) {
      let lowestRelationship = Infinity;
      bestAlliance.members.forEach(member => {
        tribe.forEach(candidate => {
          if (
            candidate !== voter &&
            candidate !== member &&
            tribe.indexOf(candidate) !== immuneIndex
          ) {
            let relationshipScore = member.relationships[candidate.name] || 0;

            if (relationshipScore < lowestRelationship) {
              lowestRelationship = relationshipScore;
              target = candidate;
            }
          }
        });
      });
      if (target) {
        let targetIndex = tribe.indexOf(target);
        votes[targetIndex] = (votes[targetIndex] || 0) + 1;
        voteDetails.push(`${voter.name} voted for ${target.name}${
          bestAlliance ? ` with alliance ${bestAlliance.name}` : ""
        }`);
        exportVotes.push({target: target.name});
        //voteSummary.push(`${voterIndex + 1}${getOrdinalSuffix(voterIndex + 1)} vote: ${target.name}`);
      }
    } else {
      let perceivedVotes = {};
      Object.keys(votes).forEach(vote => {
        perceivedVotes[vote] = (perceivedVotes[vote] || 0) + votes[vote];
      });
  
      const sortedVotes = Object.entries(perceivedVotes).sort((a, b) => b[1] - a[1]);
      
      let targetIndex;
      
      if (sortedVotes.length > 0) {
        if (Math.random() < 0.5 && tribe[targetIndex] !== voter) {
          targetIndex = parseInt(sortedVotes[0][0]);
        } else {
          const potentialFlips = tribe.filter(p => !alliances2.some(a => a.members.includes(p)) && p !== immuneIndex);
          if (potentialFlips.length > 0) {
            targetIndex = tribe.findIndex(p => p.name === potentialFlips[Math.floor(Math.random() * potentialFlips.length)].name);
            if(targetIndex === -1 || tribe[targetIndex] === voter){targetIndex = undefined;}
          }
        }
      }
  
      if (targetIndex === undefined) {
        const choices = [];
        tribe.forEach((other, i) => {
          if (i === voterIndex || i === immuneIndex) return;
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
  
          const relationshipScore = voter.relationships?.[other.name] || 0;
          weight -= relationshipScore;
          for (let n = 0; n < weight; n++) {
            choices.push(i);
          }
        });
  
        targetIndex = choices[Math.floor(Math.random() * choices.length)];
        while(tribe[targetIndex] === voter){
          targetIndex = choices[Math.floor(Math.random() * choices.length)];
        }
      }

      votes[targetIndex] = (votes[targetIndex] || 0) + 1;
      voteDetails.push(`${voter.name} voted for ${tribe[targetIndex].name}`);
      exportVotes.push({target: tribe[targetIndex].name});
      //voteSummary.push(`${voterIndex + 1}${getOrdinalSuffix(voterIndex + 1)} vote: ${tribe[targetIndex].name}`);
    }
  });

  let sortedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  let highestVoteCount = sortedVotes[0][1];
  let tiedPlayers = sortedVotes.filter(([_, count]) => count === highestVoteCount);

  voteSummary.push(...generateVotingSummary(exportVotes));

  if (tiedPlayers.length > 1) {
    voteDetails.push( `<span class="font-bold text-lg">Revote</span>`);
    voteSummary.push( `<span class="font-bold text-lg">There is a tie! Time for a revote</span>`);
    let revoteVotes = {};
    let revoteExportVotes = [];
    let revoteDetails = [];
    let revoteSummary = [];
    let tiedIndexes = tiedPlayers.map(([index]) => parseInt(index));

    tribe.forEach((voter, index) => {
      const originalVote = exportVotes.find(v => v.voter === voter.name)?.target;
      if (!tiedIndexes.includes(tribe.indexOf(voter))) {
        let revoteTarget;
          if (tiedIndexes.includes(tribe.findIndex(p => p.name === originalVote))) {
            revoteTarget = tribe.findIndex(p => p.name === originalVote);
        } else {
            revoteTarget = tiedIndexes[Math.floor(Math.random() * tiedIndexes.length)];
        }

        revoteVotes[revoteTarget] = (revoteVotes[revoteTarget] || 0) + 1;
        revoteDetails.push(`${voter.name} revoted for ${tribe[revoteTarget].name}`);
        revoteExportVotes.push({target: tribe[revoteTarget].name});
      }
    });
    voteDetails.push(...revoteDetails);
    voteSummary.push(...revoteSummary);
    voteSummary.push(...generateVotingSummary(revoteExportVotes));

    let revoteSorted = Object.entries(revoteVotes).sort((a, b) => b[1] - a[1]);

    if (revoteSorted.length > 1 && revoteSorted[0][1] === revoteSorted[1][1]) {
      let safePlayers = tribe.filter((p, i) => !tiedIndexes.includes(i) && i !== immuneIndex);
      if (safePlayers.length > 0) {
        let eliminatedByRock = safePlayers[Math.floor(Math.random() * safePlayers.length)];
        let eliminatedIndex = tribe.indexOf(eliminatedByRock);
        voteDetails.push(``);
        voteDetails.push( `<span class="font-bold text-lg">Rock Draw</span>`);
        voteSummary.push(``);
        voteSummary.push( `<span class="font-bold text-lg">Tied again! Every other non-immune player will draw rocks to decide who goes home</span>`);

        voteDetails.push(`${eliminatedByRock.name} eliminated by rocks.`);
        voteSummary.push(`${eliminatedByRock.name} eliminated by rocks.`);
        return { voteIndex: eliminatedIndex, voteDetails, voteSummary };
      }
    }

    if (revoteSorted.length === 0) {
      voteDetails.push(`<span class="font-bold text-lg">Error: No valid revote occurred.</span>`);
      voteSummary.push(`<span class="font-bold text-lg">Error: No valid revote occurred.</span>`);
      return { voteIndex: null, voteDetails, voteSummary };
    }

    let revoteLoser = parseInt(revoteSorted[0][0]);
    return { voteIndex: revoteLoser, voteDetails, voteSummary };
  }

  const [loser] = sortedVotes[0];
  removeFromAlliance(tribe[loser]);
  return { voteIndex: parseInt(loser), voteDetails, voteSummary };
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
