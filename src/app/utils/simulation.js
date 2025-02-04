import { voting, votingWinner, individualImmunity, tribalImmunity } from "./simulator";

let totalSims = 0;
let tribes = [];
let merged = false;
let winner = -1;
let loser = -1;
let state = "configure";
let week = 1;
let looping = false;

const populateTribes = (players, updateResults) => {
    const tribe1 = [];
    const tribe2 = [];
  
    players.forEach((player) => {
      if (player.tribe === 0) {
        tribe1.push(player);
      } else {
        tribe2.push(player);
      }
    });
  
    tribes = [tribe1, tribe2];
    merged = false;
    winner = -1;
    loser = -1;
    state = "immunity";
    week = 1;

    updateResults("Starting Tribes:");
    updateResults(`Tribe 1: ${tribe1.map((p) => p.name).join(", ")}`);
    updateResults(`Tribe 2: ${tribe2.map((p) => p.name).join(", ")}`);
};

  export const simulate = (players, updateResults, simSpeed) => {
    totalSims++;
    populateTribes(players, updateResults);
    go(players, updateResults, simSpeed);
  };
  
const go = (players, updateResults, simSpeed) => {
    if (!merged) {
        handlePreMergePhase(players, updateResults);
    } else {
        handlePostMergePhase(updateResults);
    }

    const waitTime = mapSpeedToWaitTime(simSpeed);
    if (state === "gameover") {
        if (looping) {
            populateTribes(players);
            simulate(players, updateResults, simSpeed);
        } else {
            updateResults("Simulation complete.");
        }
    } else {
        setTimeout(() => go(players, updateResults, simSpeed), waitTime);
    }
};

/**
 * Handles the pre-merge phase of the game.
 * @param {Array} players - Array of all players.
 * @param {Function} updateResults - Callback to update the game status.
 */
const handlePreMergePhase = (players, updateResults) => {
  const statusDiv = [];
  if (tribes[0].length + tribes[1].length === 12) {
    mergeTribes(updateResults);
  } else {
    if (state === "immunity") {
      winner = tribalImmunity(tribes);
      tribes[winner].forEach((player) => player.teamWins++);
      loser = winner === 0 ? 1 : 0;
      updateResults(`Tribe ${winner + 1} wins immunity!`);
      state = "tribal";
    } else if (state === "tribal") {
      const out = voting(tribes[loser], false);
      updateResults(`${tribes[loser][out].name} voted out at tribal council!`);
      tribes[loser].splice(out, 1);
      state = "immunity";
    }
  }
};

/**
 * Handles the post-merge phase of the game.
 * @param {Function} updateResults - Callback to update the game status.
 */
const handlePostMergePhase = (updateResults) => {
    const tribe = tribes[0];
    if (tribe.length > 3) {
      if (state === "immunity") {
        winner = individualImmunity(tribe);
        const immune = tribe[winner];
        immune.immunities++;
        updateResults(`${immune.name} wins individual immunity!`);
        state = "tribal";
      } else if (state === "tribal") {
        const immune = tribe[winner];
        const tribecopy = [...tribe];
        tribecopy.splice(winner, 1); // Remove the immune player temporarily
        const out = voting(tribecopy, true);
  
        if (out) {
            const votedout = tribecopy.splice(out, 1)[0];
            tribes[0] = tribecopy.concat(immune);
          updateResults(`${votedout.name} voted out at tribal council.`);
          tribes[1].push(votedout); // Move the voted-out player to the jury
          state = "immunity";
        } else {
          updateResults("Error: No valid player to vote out.");
          state = "gameover";
        }
      }
    } else {
      if (state === "final") {
        const soleSurvivor = votingWinner(tribes[0], tribes[1]);
        soleSurvivor.totalWins++;
        updateResults(`The sole survivor is ${soleSurvivor.name}!`);
        state = "gameover";
      } else {
        state = "final";
        updateResults("Final tribal votes are being tallied.");
      }
    }
  };

/**
 * Merges tribes into a single tribe.
 * @param {Function} updateResults - Callback to update the game status.
 */
const mergeTribes = (updateResults) => {
  merged = true;
  tribes[1].forEach((player) => tribes[0].push(player));
  tribes[1] = [];
  updateResults("Tribes are merged.");
  state = "immunity";
};

/**
 * Maps simulation speed to wait time in milliseconds.
 * @param {number} simSpeed - Simulation speed (1-100).
 * @returns {number} Wait time in milliseconds.
 */
const mapSpeedToWaitTime = (simSpeed) => {
  return Math.max(1000 - simSpeed * 10, 0);
};
