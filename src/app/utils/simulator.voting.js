// simulator.voting.js
import { removeFromAlliance } from "./simulation";
import {
  generateFormattedVotes,
  generateVotingSummary,
  generateVotingSummaryWithIdol,
} from "./simulator.utils";

/**
 * Full tribal voting logic (idols, revotes, rocks, etc.)
 * Returns:
 *  { voteIndex, sortedVotes, voteDetails, voteSummary, idols }
 */
export const voting = (tribe, alliances2, merged, immuneIndex, usableAdvantages, idols) => {
  const eligibleIndices = (tribe || [])
    .map((player, index) => ({ player, index }))
    .filter(({ player, index }) => !!player && index !== immuneIndex);

  // If there's nobody eligible to receive votes, bail out safely.
  if (eligibleIndices.length === 0) {
    return {
      voteIndex: undefined,
      sortedVotes: [],
      voteDetails: [],
      voteSummary: ["<span class=\"font-bold text-lg\">It's time to vote!</span>", "No eligible players to vote."],
      idols,
    };
  }

  const votes = {};
  const exportVotes = [];
  const voteDetails = [];
  const voteSummary = [];
  voteDetails.push(`<span class="font-bold text-lg">Vote Summary</span>`);
  voteSummary.push(`<span class="font-bold text-lg">It's time to vote!</span>`);

  let printedAllianceDissolutionHeader = false;
  const reportAllianceDissolutions = (dissolved) => {
    const list = (dissolved || []).filter(Boolean);
    if (!list.length) return;
    if (!printedAllianceDissolutionHeader) {
      voteDetails.push("");
      voteDetails.push(`<span class="font-bold text-md md:text-lg">Alliances</span>`);
      printedAllianceDissolutionHeader = true;
    }
    list.forEach((a) => {
      if (a?.name) voteDetails.push(`${a.name} dissolved.`);
    });
  };

  //voteDetails.push(...getAllianceTargets(tribe, alliances2));

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
    
    if (allianceOptions.length > 0 && Math.random() > 0.01) {
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
    }
    let targetIndex = null;
    if (target && target !== voter && (voter.relationships[target.name] < 3 || Math.random() < 0.5)) {
      targetIndex = tribe.indexOf(target);
    } else {
      let perceivedVotes = {};
      Object.keys(votes).forEach(vote => {
        perceivedVotes[vote] = (perceivedVotes[vote] || 0) + votes[vote];
      });
  
      const sortedVotes = Object.entries(perceivedVotes).sort((a, b) => b[1] - a[1]);
      
      let probability = Math.min(0 + (sortedVotes.length * 0.4), 0.9);
      
      if (sortedVotes.length > 0 && Math.random() < probability) {
        
        let weightedTargets = [];

        sortedVotes.forEach(([index, voteCount]) => {
          let candidate = tribe[parseInt(index)];
          if (!candidate || candidate === voter || parseInt(index) === immuneIndex) return;

          let relationshipScore = voter.relationships?.[candidate.name] || 0;
          let relationshipScore2 = relationshipScore+7;
          let adjustedRelationship = Math.max(1, 10 - Math.abs(relationshipScore2));
          
          for (let i = 0; i < adjustedRelationship; i++) {
            weightedTargets.push(parseInt(index));
          }
        });

        if (weightedTargets.length > 0) {
          targetIndex = weightedTargets[Math.floor(Math.random() * weightedTargets.length)];
        } else {
          const potentialFlips = tribe.filter((p) =>
            !alliances2.some((a) => a.members.includes(p)) && tribe.indexOf(p) !== immuneIndex
          );
          if (potentialFlips.length > 0) {
            targetIndex = tribe.findIndex(p => p.name === potentialFlips[Math.floor(Math.random() * potentialFlips.length)].name);
            if (targetIndex === -1 || tribe[targetIndex] === voter) {
              targetIndex = undefined;
            }
          }
        }
      }
      else{
        // fallback handled below
      }
  
      if (targetIndex === undefined || targetIndex === null) {
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

        if (choices.length > 0) {
          targetIndex = choices[Math.floor(Math.random() * choices.length)];
          while (tribe[targetIndex] === voter && choices.length > 1) {
            targetIndex = choices[Math.floor(Math.random() * choices.length)];
          }
        } else {
          // Absolute fallback: pick any non-self, non-immune player.
          const fallbackCandidates = eligibleIndices
            .map(({ index }) => index)
            .filter((i) => i !== voterIndex);
          if (fallbackCandidates.length > 0) {
            targetIndex = fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)];
          }
        }
      }
    }

    if (targetIndex === undefined || targetIndex === null || !tribe[targetIndex]) {
      // If we still failed to pick a target, skip this vote safely.
      return;
    }

    // Track votes received
    if (tribe[targetIndex]) {
      tribe[targetIndex].votesReceived = (tribe[targetIndex].votesReceived || 0) + 1;
    }

    votes[targetIndex] = (votes[targetIndex] || 0) + 1;
    voteDetails.push(`${voter.name} voted for ${tribe[targetIndex].name}`);
    exportVotes.push({target: tribe[targetIndex].name, voter: voter.name});
    //voteSummary.push(`${voterIndex + 1}${getOrdinalSuffix(voterIndex + 1)} vote: ${tribe[targetIndex].name}`);
  });

  let sortedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);

  // If voting failed to produce any votes (edge cases), force a valid outcome.
  if (sortedVotes.length === 0) {
    const fallbackIndex = eligibleIndices[0]?.index;
    if (fallbackIndex === undefined) {
      return {
        voteIndex: undefined,
        sortedVotes: [],
        voteDetails,
        voteSummary: [...voteSummary, "No votes could be cast."],
        idols,
      };
    }

    sortedVotes = [[String(fallbackIndex), 1]];
    voteDetails.push("No valid votes were generated; a default elimination was chosen.");
    exportVotes.push({ target: tribe[fallbackIndex]?.name, voter: "(default)" });
  }

  let idolUsed = false;
  let immunePlayer = null;
  let immuneIdolIndex = null;
  let idolUser = null;
  let idolPlayTarget = null;
  let idolWasMisplayed = false;

  let highestVoteCount = sortedVotes[0][1];
  let tiedPlayers = sortedVotes.filter(([_, count]) => count === highestVoteCount);

  {/*Idol Check*/}
  if (usableAdvantages.includes("immunityIdol") && idols != null && (tribe.length >= 5 || !merged)) {

    let potentialIdolPlayers = tribe.filter(player => 
      Object.values(idols)
        .filter(idol => idol !== null)
        .some(idol => idol.name === player.name)
    );

    let primaryTargetIndex = parseInt(sortedVotes[0][0]);
    let primaryTarget = tribe[primaryTargetIndex];

    if ((potentialIdolPlayers.includes(primaryTarget) && Math.random() < 0.8)) {
      idolUsed = true;
      idolUser = primaryTarget;
      idolPlayTarget = primaryTarget;
    }

    if (!idolUsed) {
      let idolHolderAlly = potentialIdolPlayers.find(player => {
          let votedForTarget = exportVotes.some(vote => vote.voter === player.name && vote.target === primaryTarget.name);

              const probability = Math.min(
                0.97,
                0.3 + (primaryTarget.relationships[player.name] * 0.15)
              );

            return (
              player.name !== primaryTarget.name &&
              primaryTarget.relationships[player.name] > 1 &&
              !votedForTarget &&
              Math.random() < probability
          );
      });

      if (idolHolderAlly) {
          idolUsed = true;
          idolUser = idolHolderAlly;
          idolPlayTarget = primaryTarget;
      }
  }

    /*if (!idolUsed) {
      let randomIdolPlay = potentialIdolPlayers.find(player =>
        Math.random() < 0.1
      );
      if (randomIdolPlay) {
        let target = Math.random() < 0.5 
            ? randomIdolPlay
            : tribe.find(ally => 
                ally !== randomIdolPlay && 
                randomIdolPlay.relationships[ally.name] > 2 &&
                Math.random() < 0.3
            );

        if (target) {
            immunePlayer = target.name;
            immuneIdolIndex = tribe.indexOf(target);
            idolUsed = true;
            idolUser = randomIdolPlay;
            voteSummary.push(`<span class="font-bold text-lg">${idolUser.name} plays the Hidden Immunity Idol on ${immunePlayer}!</span>`);
        }
      }
    }*/

    highestVoteCount = sortedVotes[0][1];
    tiedPlayers = sortedVotes.filter(([_, count]) => count === highestVoteCount);

    // Small chance of an incorrect idol play (fun surprise): the idol is played,
    // but on the wrong person, so it doesn't negate the main target's votes.
    if (idolUsed && idolUser && idolPlayTarget) {
      const topNames = new Set(
        (tiedPlayers || [])
          .map(([idx]) => tribe[parseInt(idx)]?.name)
          .filter(Boolean)
      );

      const misplayCandidates = (tribe || []).filter(
        (p) => p && !topNames.has(p.name)
      );

      // Chance applies only when an idol is already being played.
      const MISPLAY_CHANCE = 0.12;
      if (misplayCandidates.length > 0 && Math.random() < MISPLAY_CHANCE) {
        idolWasMisplayed = true;

        // Misplay can be on self or another non-top-vote player.
        let wrongTarget = null;
        if (idolUser?.name && !topNames.has(idolUser.name) && Math.random() < 0.5) {
          wrongTarget = idolUser;
        } else {
          wrongTarget = misplayCandidates[Math.floor(Math.random() * misplayCandidates.length)];
        }

        idolPlayTarget = wrongTarget;
      }

      immunePlayer = idolPlayTarget?.name || null;
      immuneIdolIndex = idolPlayTarget ? tribe.indexOf(idolPlayTarget) : null;

      // Track idol play stat
      if (idolUser) {
        idolUser.idolsPlayed = (idolUser.idolsPlayed || 0) + 1;
        // Optionally, increase popularity for successful idol play
        if (!idolWasMisplayed && idolPlayTarget && idolPlayTarget.name === immunePlayer) {
          idolUser.popularity = (idolUser.popularity || 0) + 1;
        }
      }

      // Track votes negated by idol
      if (immunePlayer) {
        // For each vote that was negated, increment votesNegated for the immune player
        exportVotes.forEach(vote => {
          if (vote.target === immunePlayer) {
            const immuneP = tribe.find(p => p.name === immunePlayer);
            if (immuneP) {
              immuneP.votesNegated = (immuneP.votesNegated || 0) + 1;
            }
          }
        });
      }

      const playText = idolUser?.name === immunePlayer
        ? `${idolUser.name} plays the Hidden Immunity Idol!`
        : `${idolUser.name} plays the Hidden Immunity Idol on ${immunePlayer}!`;

      voteSummary.push(`<span class="font-bold text-md md:text-lg">${playText}</span>`);
    }

    voteSummary.push(...generateVotingSummaryWithIdol([...exportVotes], immunePlayer, tribe));
    
    let newSortedVotes;

    if (idolUsed && idolUser) {
      idolUser.hasIdol = false;
      Object.keys(idols).forEach(key => {
        if (idols[key] && idols[key].name === idolUser.name) {
            idols[key] = null;
        }
      });
      let validVotes = exportVotes.filter(vote => vote.target !== immunePlayer);
      let newVotesCount = {};

      validVotes.forEach(vote => {
        let targetIndex = tribe.findIndex(p => p.name === vote.target);
        if (targetIndex !== -1) {
            newVotesCount[targetIndex] = (newVotesCount[targetIndex] || 0) + 1;
        }
      });

      newSortedVotes = Object.entries(newVotesCount).map(([key, value]) => [parseInt(key), value])
            .sort((a, b) => b[1] - a[1]); 

      if (newSortedVotes.length > 1 && newSortedVotes[0][1] === newSortedVotes[1][1]) {
        highestVoteCount = newSortedVotes[0][1];
        tiedPlayers = newSortedVotes.filter(([_, count]) => count === highestVoteCount);
      } else if (newSortedVotes.length > 0) {
        const [loserIndex] = newSortedVotes[0];
        const allianceRemoval = removeFromAlliance(tribe[loserIndex]);
        reportAllianceDissolutions(allianceRemoval?.dissolvedAlliances);
        Object.keys(idols).forEach(key => {
          if (idols[key] && idols[key].name === tribe[loserIndex].name) {
              tribe[loserIndex].hasIdol = false;
              idols[key] = null;
          }
        });
        return { voteIndex: parseInt(loserIndex), sortedVotes: generateFormattedVotes(newSortedVotes), voteDetails, voteSummary, idols };
      } else {
        voteSummary.push(`<span class="font-bold text-md md:text-lg">All votes were nullified. Revote required!</span>`);
        return { voteIndex: null, sortedVotes: null, voteDetails, voteSummary, idols };
      }
    }
  } else {
    voteSummary.push(...generateVotingSummary([...exportVotes], tribe));
  }

  if (tiedPlayers.length > 1) {
    voteDetails.push( `<span class="font-bold text-md md:text-lg">Revote</span>`);
    voteSummary.push( `<span class="font-bold text-md md:text-lg">There is a tie! Time for a revote</span>`);
    let revoteVotes = {};
    let revoteExportVotes = [];
    let revoteDetails = [];
    let revoteSummary = [];
    let tiedIndexes = tiedPlayers.map(([index]) => parseInt(index));

    tribe.forEach((voter, index) => {
      const originalVote = exportVotes.find(v => v.voter === voter.name)?.target;
      if (!tiedIndexes.includes(tribe.indexOf(voter))) {
        let revoteTargetIndex;
        if (tiedIndexes.includes(tribe.findIndex(p => p.name === originalVote)) && Math.random() < 0.9) {
          revoteTargetIndex = tribe.findIndex(p => p.name === originalVote);
        } else {
          revoteTargetIndex = tiedIndexes[Math.floor(Math.random() * tiedIndexes.length)];
        }

        revoteVotes[revoteTargetIndex] = (revoteVotes[revoteTargetIndex] || 0) + 1;
        revoteDetails.push(`${voter.name} revoted for ${tribe[revoteTargetIndex].name}`);
        revoteExportVotes.push({ target: tribe[revoteTargetIndex].name, voter: voter.name });
      }
    });
    voteDetails.push(...revoteDetails);
    voteSummary.push(...revoteSummary);
    voteSummary.push(...generateVotingSummary([...revoteExportVotes], tribe));

    let revoteSorted = Object.entries(revoteVotes).sort((a, b) => b[1] - a[1]);

    if (revoteSorted.length === 0) {
      // Edge case: no revotes could be cast; force an outcome among tied players.
      const fallbackIndex = tiedIndexes[0];
      if (fallbackIndex === undefined) {
        return { voteIndex: undefined, sortedVotes: [], voteDetails, voteSummary, idols };
      }
      return {
        voteIndex: parseInt(fallbackIndex),
        sortedVotes: generateFormattedVotes([[parseInt(fallbackIndex), 1]]),
        voteDetails,
        voteSummary: [...voteSummary, "No revote ballots were cast; a default elimination was chosen."],
        idols,
      };
    }

    let highestVoteCount = revoteSorted[0][1];
    let safePlayers = revoteSorted
      .filter(([_, count]) => count === highestVoteCount)
      .map(([name]) => name);

    if(revoteSorted.length > 1 && revoteSorted[0][1] === revoteSorted[1][1] && merged && tribe.length === 4){
      if (safePlayers.length > 0) {
        let eliminatedByFire = safePlayers[Math.floor(Math.random() * safePlayers.length)];
        let eliminatedIndex = eliminatedByFire;
        voteDetails.push(``);
        voteDetails.push( `<span class="font-bold text-md md:text-lg">Firemaking competition</span>`);
        voteSummary.push(``);
        voteSummary.push( `<span class="font-bold text-md md:text-lg">Tied again! Since it is final 4, we will have a firemaking challenge to decide who goes home.</span>`);

        voteDetails.push(`${tribe[eliminatedByFire].name} eliminated in fire.`);
        voteSummary.push(`${tribe[eliminatedByFire].name} eliminated in fire.`);
        const allianceRemoval = removeFromAlliance(tribe[eliminatedIndex]);
        reportAllianceDissolutions(allianceRemoval?.dissolvedAlliances);
        return { voteIndex: eliminatedIndex, sortedVotes: generateFormattedVotes(revoteSorted), voteDetails, voteSummary, idols };
      }
    } else if (revoteSorted.length > 1 && revoteSorted[0][1] === revoteSorted[1][1]) {
      let eligibleForRocks = tribe.filter(
        (p, i) => !safePlayers.includes(`${i}`) && p.name !== immuneIndex && p.name !== immuneIdolIndex
      );
    
      if (eligibleForRocks.length > 0) {
        let eliminatedByRock = eligibleForRocks[Math.floor(Math.random() * eligibleForRocks.length)];
        let eliminatedIndex = tribe.indexOf(eliminatedByRock);
        voteDetails.push(``);
        voteDetails.push( `<span class="font-bold text-md md:text-lg">Rock Draw</span>`);
        voteSummary.push(``);
        voteSummary.push( `<span class="font-bold text-md md:text-lg">Tied again! Every other non-immune player will draw rocks to decide who goes home</span>`);

        voteDetails.push(`${eliminatedByRock.name} eliminated by rocks.`);
        voteSummary.push(`${eliminatedByRock.name} drew the bad rock and is eliminated!`);
        const allianceRemoval = removeFromAlliance(tribe[eliminatedIndex]);
        reportAllianceDissolutions(allianceRemoval?.dissolvedAlliances);
        Object.keys(idols).forEach(key => {
          if (idols[key] && idols[key].name === tribe[eliminatedIndex].name) {
              tribe[eliminatedIndex].hasIdol = false;
              idols[key] = null;
          }
        });
        return { voteIndex: eliminatedIndex, sortedVotes: generateFormattedVotes(revoteSorted), voteDetails, voteSummary, idols };
      }
    }

    if (revoteSorted.length === 0) {
      voteDetails.push(`<span class="font-bold text-md md:text-lg">Error: No valid revote occurred.</span>`);
      voteSummary.push(`<span class="font-bold text-md md:text-lg">Error: No valid revote occurred.</span>`);
      return { voteIndex: null, sortedVotes: null, voteDetails, voteSummary, idols };
    }

    let revoteLoser = parseInt(revoteSorted[0][0]);
    const allianceRemoval = removeFromAlliance(tribe[revoteLoser]);
    reportAllianceDissolutions(allianceRemoval?.dissolvedAlliances);
    Object.keys(idols).forEach(key => {
      if (idols[key] && idols[key].name === tribe[revoteLoser].name) {
          tribe[revoteLoser].hasIdol = false;
          idols[key] = null;
      }
    });
    return { voteIndex: revoteLoser, sortedVotes: generateFormattedVotes(revoteSorted), voteDetails, voteSummary, idols };
  }

  const [loser] = sortedVotes[0];
  removeFromAlliance(tribe[loser]);
  Object.keys(idols).forEach(key => {
    if (idols[key] && idols[key].name === tribe[loser].name) {
        tribe[loser].hasIdol = false;
        idols[key] = null;
    }
  });
  return { voteIndex: parseInt(loser), sortedVotes: generateFormattedVotes(sortedVotes), voteDetails, voteSummary, idols };
};