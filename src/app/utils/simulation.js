import { voting, votingWinner, individualImmunity, tribalImmunity, getVoteResults, determineVotedOut } from "./simulator";

let tribes = [];
let merged = false;
let winner = -1;
let loser = -1;
let state = "configure";
let week = 1;

const populateTribes = (players, updateResults) => {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const tribe1 = shuffledPlayers.slice(0, 10);
  const tribe2 = shuffledPlayers.slice(10, 20);

  tribes = [tribe1, tribe2];
  merged = false;
  winner = -1;
  loser = -1;
  state = "immunity";
  week = 1;
  initializeRelationships(players);
};

const initializeRelationships = (players) => {
  players.forEach((player) => {
    player.relationships = {};
    players.forEach((other) => {
      if (player !== other) {
        player.relationships[other.name] = Math.floor(Math.random() * 11) - 5;
      }
    });
  });
};

/*const updateRelationships = (tribe) => {
  tribe.forEach((player) => {
    tribe.forEach((other) => {
      if (player !== other) {
        const change = Math.random() > 0.5 ? 1 : -1; // 50% chance to increase or decrease
        player.relationships[other.name] = (player.relationships[other.name] || 0) + change;
      }
    });
  });
};*/

const generateRelationshipEvent = (tribe, customEvents) => {
  if (tribe.length < 2) return null;

  const [player1, player2] = tribe
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  let eventType, severity, message, numPlayers, eventText, effectText;

  if (customEvents.length > 0) {
    const randomCustomEvent = customEvents[Math.floor(Math.random() * customEvents.length)];
    eventType = randomCustomEvent.type;
    severity = randomCustomEvent.severity;
    message = randomCustomEvent.description;
    numPlayers = randomCustomEvent.numPlayers;
  } else {
    eventType = Math.random() > 0.5 ? "positive" : "negative";
    severity = Math.floor(Math.random() * 3) + 1;
    message = eventType === "positive"
      ? `{Player1} and {Player2} bonded over a shared experience.`
      : `{Player1} and {Player2} had a heated argument!`;
    numPlayers = 2;
  }

  if (numPlayers === 2 && eventType !== "neutral") {
    const effect = eventType === "positive" ? severity : -severity;
    player1.relationships[player2.name] += effect;
    player2.relationships[player1.name] += effect;
  }

  if (numPlayers === 2 && eventType !== "neutral") {
    let effectSmallText = "relationship ";
    if(eventType === "positive"){
      for(let i = 0; i < severity; i++){
        effectSmallText += "+";
      }
    }
    else{
      for(let i = 0; i < severity; i++){
        effectSmallText += "-";
      }
    }
    effectText = ` <span class="${eventType === "positive" ? 'text-green-400' : 'text-red-400'}">${effectSmallText}</span>`;
  }

  eventText = message
    .replace(/{Player1}/g, player1.name)
    .replace(/{Player2}/g, player2?.name || "");

  const images = [];
  if (numPlayers === 1 && player1.image) {
    images.push(player1.image);
  } else if (numPlayers === 2) {
    if (player1.image) images.push(player1.image);
    if (player2.image) images.push(player2.image);
  }

  return {
    type: "event",
    message: numPlayers === 2 ? [eventText, effectText] : eventText,
    images: images,
    numPlayers: numPlayers
  };
};

  export const simulate = (players, updateResults, customEvents) => {
    let episodes = [];

    populateTribes(players, updateResults);
  
    while (state != "gameover") {
      let episode = [];
  
      if (!merged) {
        handlePreMergePhase((message) => episode.push(message), customEvents);
      } else {
        handlePostMergePhase((message) => episode.push(message), customEvents);
      }
  
      episodes.push(episode);
    }
  
    updateResults(episodes);
  };

/**
 * Handles the pre-merge phase of the game.
 * @param {Function} updateResults - Callback to update the game status.
 */
const handlePreMergePhase = (updateResults, customEvents) => {
  if (tribes[0].length + tribes[1].length === 12) {
    mergeTribes(updateResults);
    handlePostMergePhase(updateResults, customEvents);
  } else {
      updateResults(
        { type: "tribe", title: "Tribe 1", members: [...tribes[0]] }
      );
      updateResults(
        { type: "tribe", title: "Tribe 2", members: [...tribes[1]] }
      );

      for(let i = 0; i < 5; i++){
        let willEventOccur = Math.random();
        if(willEventOccur > 0.9){
          const relationshipEvent1 = generateRelationshipEvent(tribes[0], customEvents);
          if (relationshipEvent1) updateResults(relationshipEvent1);
        }
        else if(willEventOccur < 0.1){
          const relationshipEvent2 = generateRelationshipEvent(tribes[1], customEvents);
          if (relationshipEvent2) updateResults(relationshipEvent2);
        }
      }

      winner = tribalImmunity(tribes);
      tribes[winner].forEach((player) => player.teamWins++);
      loser = winner === 0 ? 1 : 0;
      updateResults({ type: "event", message: `Tribe ${winner + 1} wins immunity!` });
      state = "tribal";

      const { voteIndex: out, voteDetails } = voting(tribes[loser], false);
      if (out !== undefined) {
          const votedout = tribes[loser].splice(out, 1)[0];
          updateResults({
            type: "voting",
            message: voteDetails,
          });
          updateResults({
            type: "event",
            message: `${votedout.name} voted out at tribal council.`,
            images: [votedout.image]
          });
        state = "immunity";
      } else {
        updateResults({
          type: "event",
          message: "Error: No valid player to vote out."
        });
        state = "gameover";
      }
  }
};

/**
 * Handles the post-merge phase of the game.
 * @param {Function} updateResults - Callback to update the game status.
 */
const handlePostMergePhase = (updateResults, customEvents) => {
    const tribe = tribes[0];
    updateResults(
      { type: "tribe", title: "Current Tribe", members: [...tribes[0]] },
    );
    if (tribes[1].length > 0) {
      updateResults(
        { type: "tribe", title: "Jury", members: [...tribes[1]] }
      );
    }

    if (tribe.length > 3) {
        for(let i = 0; i < 5; i++){
          let willEventOccur = Math.random();
          if(willEventOccur > 0.7){
            const relationshipEvent1 = generateRelationshipEvent(tribes[0], customEvents);
            if (relationshipEvent1) updateResults(relationshipEvent1);
          }
        }

        winner = individualImmunity(tribe);
        const immune = tribe[winner];
        immune.immunities++;
        updateResults({
          type: "event",
          message: `${immune.name} wins individual immunity!`,
          images: [immune.image]
        });
        state = "tribal";
        const tribecopy = [...tribe];

        const { voteIndex: out, voteDetails } = voting(tribecopy, false, winner);
  
        if (out !== undefined) {
            const votedout = tribecopy.splice(out, 1)[0];
            tribes[0] = tribecopy;
            updateResults({
              type: "voting",
              message: voteDetails,
            });
            updateResults({
              type: "event",
              message: `${votedout.name} voted out at tribal council.`,
              images: [votedout.image]
            });
          tribes[1].push(votedout); // Move the voted-out player to the jury
          state = "immunity";
        } else {
          updateResults({
            type: "event",
            message: "Error: No valid player to vote out."
          });
          state = "gameover";
        }
    } else {
        state = "final";
        updateResults({ type: "event", message: "Final tribal votes are being tallied." });
        const soleSurvivor = votingWinner(tribes[0], tribes[1]);
        soleSurvivor.totalWins++;
        updateResults({
          type: "event",
          message: `The sole survivor is ${soleSurvivor.name}!`,
          images: [soleSurvivor.image]
        });
        state = "gameover";
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
  updateResults({ type: "event", message: "Tribes are merged!"});
  state = "immunity";
};