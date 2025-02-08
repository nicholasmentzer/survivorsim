import { voting, votingWinner, individualImmunity, tribalImmunity, getVoteResults, determineVotedOut } from "./simulator";

let tribes = [];
let merged = false;
let winner = -1;
let loser = -1;
let state = "configure";
let week = 1;
let alliances = [];
let tribeNames = { tribe1: "Tribe 1", tribe2: "Tribe 2", merge: "Merge Tribe" };
let tribeIdols = {tribe1: null, tribe2: null, merge: null};
let usableAdvantages = [];
let randomAllianceNames = [
  "The Titans",
  "The Thunderbolts",
  "The Ironclads",
  "The Unbreakables",
  "The Dominators",
  "The Avalanche",
  "The Colossals",
  "The Echoes",
  "The Shadows",
  "The Mirage",
  "The Visionaries",
  "The Astrals",
  "The Omens",
  "The Luminaries",
  "The Dreamers",
  "The Illusions",
  "The Gladiators",
  "The Marauders",
  "The Outlaws",
  "The Spartans",
  "The Conquerors",
  "The Warlords",
  "The Sentinels",
  "The Phantoms",
  "The Nomads",
  "The Guardians",
  "The Shamans",
  "The Sphinxes",
  "The Valkyries",
  "The Wraiths",
  "The Banshees",
  "The Nomads",
  "The Mystics",
  "The Revenants",
  "The Warlocks",
  "The Arbiters",
  "The Seers",
  "The Elders",
  "The Cryptids",
  "The Ronin",
  "The Vanguard",
  "The Warhounds",
  "The Legionnaires",
  "The Bloodhounds",
  "The Dreadnoughts",
  "The Strikers",
  "The Juggernauts",
  "The Outriders",
  "The Harbingers",
];


export const resetSimulation = () => {
  tribes = [];
  merged = false;
  winner = -1;
  loser = -1;
  state = "configure";
  week = 1;
  alliances = [];
  tribeNames = { tribe1: "Tribe 1", tribe2: "Tribe 2", merge: "Merge Tribe" };
  tribeIdols = {tribe1: null, tribe2: null, merge: null};
  usableAdvantages = [];
  randomAllianceNames = [
    "The Titans",
    "The Thunderbolts",
    "The Ironclads",
    "The Unbreakables",
    "The Dominators",
    "The Avalanche",
    "The Colossals",
    "The Echoes",
    "The Shadows",
    "The Mirage",
    "The Visionaries",
    "The Astrals",
    "The Omens",
    "The Luminaries",
    "The Dreamers",
    "The Illusions",
    "The Gladiators",
    "The Marauders",
    "The Outlaws",
    "The Spartans",
    "The Conquerors",
    "The Predators",
    "The Warlords",
    "The Sentinels",
    "The Phantoms",
    "The Nomads",
    "The Guardians",
    "The Shamans",
    "The Sphinxes",
    "The Valkyries",
    "The Wraiths",
    "The Banshees",
    "The Nomads",
    "The Mystics",
    "The Revenants",
    "The Warlocks",
    "The Arbiters",
    "The Seers",
    "The Elders",
    "The Cryptids",
    "The Ronin",
    "The Vanguard",
    "The Warhounds",
    "The Legionnaires",
    "The Bloodhounds",
    "The Dreadnoughts",
    "The Strikers",
    "The Juggernauts",
    "The Outriders",
    "The Harbingers",
  ];
};

export const removeFromAlliance = (loser) => {
  alliances = alliances.map(alliance => ({
    ...alliance,
    members: alliance.members.filter(member => member !== loser),
  })).filter(alliance => alliance.members.length > 1);
}

const populateTribes = (players, updateResults) => {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const tribe1 = players.slice(0, 10);
  const tribe2 = players.slice(10, 20);

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
        player.relationships[other.name] = Math.floor(Math.random() * 5) - 2;
      }
    });
  });
};

const detectDrasticRelationships = (tribe, updateResults) => {
  let drasticEvents = [];
  let seenPairs = new Set();

  drasticEvents.push({
    type: "relationship"
  });

  tribe.forEach(player1 => {
    tribe.forEach(player2 => {
      let types = [
        `${player1.name} and ${player2.name} really dislike each other!`,
        `${player1.name} thinks ${player2.name} is a big threat`,
        `${player1.name} wants to target ${player2.name} sooner rather than later`,
      ];
      if (player1 !== player2 && player1.relationships[player2.name] <= -3) {
        let pairKey = [player1.name, player2.name].sort().join("_");

        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);

          drasticEvents.push({
            type: "event",
            message: `<span class="text-red-400">${types[Math.floor(Math.random() * types.length)]}</span>`,
            images: [player1.image, player2.image],
          });
        }
      }
    });
  });

  if(drasticEvents.length < 3){
    tribe.forEach(player1 => {
      tribe.forEach(player2 => {
        let types = [
          `${player1.name} and ${player2.name} really dislike each other!`,
          `${player1.name} thinks ${player2.name} is a big threat`,
          `${player1.name} wants to target ${player2.name} sooner rather than later`,
        ];
        if (player1 !== player2 && player1.relationships[player2.name] <= -1) {
          let pairKey = [player1.name, player2.name].sort().join("_");
  
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
  
            drasticEvents.push({
              type: "event",
              message: `<span class="text-red-400">${types[Math.floor(Math.random() * types.length)]}</span>`,
              images: [player1.image, player2.image],
            });
          }
        }
      });
    });
    drasticEvents = drasticEvents.slice(0,2);
  }

  drasticEvents.forEach(event => updateResults(event));
};

const findIdol = (tribe, tribeName, merged) => {
  if (!usableAdvantages.includes("immunityIdol")) return;
  if (!merged) {
    if (tribeIdols[tribeName]) return;
  }
  else {
    if (tribeIdols["tribe1"] || tribeIdols["tribe2"] || tribeIdols["merge"]) return null;
  }

  if (Math.random() < 0.50) {
    let eligiblePlayers = tribe.filter(player => !player.hasIdol);
    if (eligiblePlayers.length > 0) {
      let finder = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
      finder.hasIdol = true;
      tribeIdols[tribeName] = finder;
      return {
        type: "event",
        message: `${finder.name} found a Hidden Immunity Idol!`,
        images: [finder.image]
      };
    }
  }
  return null;
};

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
      ? `Player1 and Player2 bonded over a shared experience.`
      : `Player1 and Player2 had a heated argument!`;
    numPlayers = 2;
  }

  if (numPlayers === 2 && eventType !== "neutral") {
    const effect = eventType === "positive" ? severity : -severity;
    player1.relationships[player2.name] = Math.max(-5, Math.min(5, player1.relationships[player2.name] + effect));
    player2.relationships[player1.name] = Math.max(-5, Math.min(5, player2.relationships[player1.name] + effect));
  }

  if (numPlayers === 2 && eventType !== "neutral") {
    let effectSmallText = "relationship ";
    if(eventType === "positive"){
      for(let i = 0; i < severity; i++){
        effectSmallText += "+ ";
      }
    }
    else{
      for(let i = 0; i < severity; i++){
        effectSmallText += "- ";
      }
    }
    effectText = ` <span class="${eventType === "positive" ? 'text-green-400' : 'text-red-400'}">${effectSmallText}</span>`;
  }

  eventText = message
    .replace(/\bPlayer1/g, player1.name)
    .replace(/\bPlayer2/g, player2?.name || "");

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

const manageAlliances = (tribe) => {
  let newAlliances = [];
  let dissolvedAlliances = [];
  let existingAlliances2 = [...alliances];

  const allianceThreshold = 0.9 + (0.0999 * (1 - Math.exp(-alliances.length / (tribe.length * 2))));

  tribe.forEach(player => {

    let potentialMembers = tribe.filter(
      other => player !== other && player.relationships[other.name] >= 1
    );

    if (potentialMembers.length >= 1 && Math.random() > allianceThreshold) {
      const members = [player, ...potentialMembers];

      const isDuplicate = existingAlliances2.some(existingAlliance =>
        existingAlliance.members.length === members.length &&
        existingAlliance.members.every(member => members.includes(member))
      );

      let baseStrength = potentialMembers.reduce((sum, p) => sum + player.relationships[p.name], 0) / potentialMembers.length;

      let scaledStrength = Math.round(((baseStrength + 5) / 10) * 9 + 1);

      scaledStrength = Math.max(1, Math.min(10, scaledStrength));

      if (!isDuplicate) {
        const randomIndex = Math.floor(Math.random() * randomAllianceNames.length);
        let allianceName = randomAllianceNames[randomIndex];
        randomAllianceNames.splice(randomIndex, 1);
        newAlliances.push({
          name: allianceName,
          members: [player, ...potentialMembers],
          strength: scaledStrength,
        });
      }
    }
  });

  alliances = alliances.concat(newAlliances);

  let existingAlliances = [];
  alliances.forEach(alliance => {
    let totalRelationship = 0;
    let numPairs = 0;
  
    alliance.members.forEach(player => {
      alliance.members.forEach(other => {
        if (player !== other) {
          totalRelationship += player.relationships[other.name];
          numPairs++;
        }
      });
    });
  
    if (alliance.strength <= 4 && Math.random() < .5) {
      if (newAlliances.includes(alliance)){
        existingAlliances.push(alliance);
      } else {
        dissolvedAlliances.push(alliance);
      }
    } else {
      existingAlliances.push(alliance);
    }
  });

  alliances = existingAlliances;

  return { newAlliances, dissolvedAlliances, allAlliances: alliances };
};

export const simulate = (players, updateResults, customEvents, tribes, advantages) => {
  let episodes = [];
  tribeNames = tribes;
  Object.entries(advantages).forEach(([key, value]) => {
    if (value) {
      usableAdvantages.push(key);
    }
  });

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
        { type: "tribe", title: tribeNames.tribe1, members: [...tribes[0]] }
      );

      const idolEvent1 = findIdol(tribes[0], "tribe1");
      if (idolEvent1) updateResults(idolEvent1);

      for(let i = 0; i < 5; i++){
        let willEventOccur = Math.random();
        if(willEventOccur > 0.7){
          const relationshipEvent1 = generateRelationshipEvent(tribes[0], customEvents);
          if (relationshipEvent1) updateResults(relationshipEvent1);
        }
      }
      const alliances1 = manageAlliances(tribes[0]);

      if (alliances1.newAlliances != null) {
        if (alliances1.newAlliances.length > 0) {
          updateResults({
            type: "alliance",
            title: `New Alliances Formed (${tribeNames.tribe1})`,
            alliances: alliances1.newAlliances,
          });
        }
      }

      if (alliances1.dissolvedAlliances != null) {
        if (alliances1.dissolvedAlliances.length > 0) {
          updateResults({
            type: "alliance",
            title: `Alliances Dissolved (${tribeNames.tribe1})`,
            alliances: alliances1.dissolvedAlliances,
          });
        }
      }

      updateResults(
        { type: "tribe", title: tribeNames.tribe2, members: [...tribes[1]] }
      );
      const idolEvent2 = findIdol(tribes[1], "tribe2");
      if (idolEvent2) updateResults(idolEvent2);
      for(let i = 0; i < 5; i++){
        let willEventOccur = Math.random();
        if(willEventOccur < 0.3){
          const relationshipEvent2 = generateRelationshipEvent(tribes[1], customEvents);
          if (relationshipEvent2) updateResults(relationshipEvent2);
        }
      }
      const alliances2 = manageAlliances(tribes[1]);

      if (alliances2.newAlliances != null) {
        if (alliances2.newAlliances.length > 0) {
          updateResults({
            type: "alliance",
            title: `New Alliances Formed (${tribeNames.tribe2})`,
            alliances: alliances2.newAlliances,
          });
        }
      }

      if (alliances2.dissolvedAlliances != null) {
        if (alliances2.dissolvedAlliances.length > 0) {
          updateResults({
            type: "alliance",
            title: `Alliances Dissolved (${tribeNames.tribe2})`,
            alliances: alliances2.dissolvedAlliances,
          });
        }
      }

      if (alliances2.allAlliances != null) {
        if (alliances2.allAlliances.length > 0) {
          updateResults({
            type: "alliance",
            title: "Current Alliances",
            alliances: alliances2.allAlliances,
          });
        }
      }

      /*updateResults({
        type: "idols",
        idols: tribeIdols,
      });*/

      winner = tribalImmunity(tribes);
      tribes[winner].forEach((player) => player.teamWins++);
      loser = winner === 0 ? 1 : 0;
      updateResults({ type: "immunity", message: `${winner + 1 === 1 ? tribeNames.tribe1 : tribeNames.tribe2} wins immunity! So, ${winner + 1 === 2 ? tribeNames.tribe1 : tribeNames.tribe2} will be going to tribal council`, members: [...tribes[loser]] });

      detectDrasticRelationships(tribes[loser], updateResults);

      state = "tribal";
      const { voteIndex: out, sortedVotes: sortedVotes, voteDetails, voteSummary } = voting(tribes[loser], alliances, false, -1, usableAdvantages, tribeIdols);
      if (out !== undefined) {
          const votedout = tribes[loser].splice(out, 1)[0];
          updateResults({
            type: "voting-summary",
            message: voteSummary,
          });
          updateResults({
            type: "event",
            message: `${votedout.name} voted out by a vote of ${sortedVotes}`,
            images: [votedout.image]
          });
          updateResults({
            type: "voting",
            message: voteDetails,
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
      { type: "tribe", title: tribeNames.merge, members: [...tribes[0]] },
    );
    if (tribes[0].length === 3) {
      updateResults(
        { type: "tribe", title: "Jury", members: [...tribes[1]] }
      );
    }

    if (tribe.length > 3) {
      const idolEvent1 = findIdol(tribes[0], "merge");
      if (idolEvent1) updateResults(idolEvent1);
        for(let i = 0; i < 5; i++){
          let willEventOccur = Math.random();
          if(willEventOccur > 0.5){
            const relationshipEvent1 = generateRelationshipEvent(tribes[0], customEvents);
            if (relationshipEvent1) updateResults(relationshipEvent1);
          }
        }
        const alliances1 = manageAlliances(tribes[0]);

        if (alliances1.newAlliances != null) {
          if (alliances1.newAlliances.length > 0) {
            updateResults({
              type: "alliance",
              title: "New Alliances Formed",
              alliances: alliances1.newAlliances,
            });
          }
        }
    
        if (alliances1.dissolvedAlliances != null) {
          if (alliances1.dissolvedAlliances.length > 0) {
            updateResults({
              type: "alliance",
              title: "Alliances Dissolved",
              alliances: alliances1.dissolvedAlliances,
            });
          }
        }
    
        if (alliances1.allAlliances != null) {
          if (alliances1.allAlliances.length > 0) {
            updateResults({
              type: "alliance",
              title: "Current Alliances",
              alliances: alliances1.allAlliances,
            });
          }
        }

        /*updateResults({
          type: "idols",
          idols: tribeIdols,
        });*/

        winner = individualImmunity(tribe);
        const immune = tribe[winner];
        immune.immunities++;
        updateResults({
          type: "event",
          message: `${immune.name} wins individual immunity!`,
          images: [immune.image]
        });

        detectDrasticRelationships(tribes[0], updateResults);

        state = "tribal";
        const tribecopy = [...tribe];
        const { voteIndex: out, sortedVotes: sortedVotes, voteDetails, voteSummary } = voting(tribecopy, alliances, true, winner, usableAdvantages, tribeIdols);
  
        if (out !== undefined) {
            const votedout = tribecopy.splice(out, 1)[0];
            tribes[0] = tribecopy;
            updateResults({
              type: "voting-summary",
              message: voteSummary,
            });
            updateResults({
              type: "event",
              message: `${votedout.name} voted out by a vote of ${sortedVotes}`,
              images: [votedout.image]
            });
            updateResults({
              type: "voting",
              message: voteDetails,
            });
          tribes[1].push(votedout);
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
        const { winner, voteDetails, voteSummary } = votingWinner(tribes[0], tribes[1]);
        updateResults({
          type: "voting-summary", message: voteSummary
        });
        updateResults({
          type: "event", message: `${winner.name} is the Sole Survivor!`, images: [winner.image]
        });
        updateResults({
          type: "voting", message: voteDetails
        });
        winner.totalWins++;
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