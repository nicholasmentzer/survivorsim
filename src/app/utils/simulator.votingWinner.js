// simulator.votingWinner.js
import { getRandomInt, getOrdinalSuffix } from "./simulator.utils";

/**
 * Final jury vote for the winner.
 */
export const votingWinner = (finalThree, jury) => {
  const choices = [];
  const voteDetails = [];
  const voteSummary = [];
  
  finalThree.forEach((player, i) => {
    player.voteCount = 0;
    for (let n = 0; n < player.likeability; n++) choices.push(i);
    for (let n = 0; n < player.strategicness; n++) choices.push(i);
  });

  jury.forEach((juror, index) => {
    const vote = choices[getRandomInt(choices.length)];
    finalThree[vote].voteCount++;
    
    voteDetails.push(`${juror.name} voted for ${finalThree[vote].name}`);

    voteSummary.push(`
      <div class="flex flex-col items-center space-x-3">
        <img src="${finalThree[vote].image}" alt="${finalThree[vote].name}" class="mb-2 w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600">
        <p>${index + 1}${getOrdinalSuffix(index + 1)} vote: ${finalThree[vote].name}</p>
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