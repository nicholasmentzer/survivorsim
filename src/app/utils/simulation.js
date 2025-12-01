import { voting, votingWinner, individualImmunity, tribalImmunity, getVoteResults, determineVotedOut } from "./simulator";
import { finalPlacements } from "../page";

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
    "The Legion",
    "The Bloodhounds",
    "The Dreadnoughts",
    "The Strikers",
    "The Juggernauts",
    "The Outriders",
    "The Harbingers",
    "Under the Radar",
    "The Inside Job",
    "The Illusionists",
    "Smoke & Mirrors",
    "The Power Brokers",
    "The Storytellers",
    "The Demon's Gambit",
    "The Mad Hatters",
    "The Townsfolk Tribunal",
    "The Evil Twins",
    "The Saints",
    "The Scarlet Mark",
    "The Poisoners",
    "The Lunatics",
    "The Empaths",
    "The Fortune Tellers",
    "The Ravenkeepers",
    "The No Dashii Society",
    "The Witches",
    "The Undertakers",
    "The Minions",
    "The Shabaloth Coven",
    "The Oracles",
    "The Town Square Syndicate",
    "The Imps",
    "The Phantom Court",
    "The Vortox",
    "The Outsiders",
    "The Goons"
];
let customRandomAllianceNames = [];
let useOnlyCustomEvents = false;
let tribeSize = 10;
let mergeAt = 12;
let count = 20;
let numberedAlliances = true;
let numberedTribe1 = 1;
let numberedTribe2 = 1;
let numberedMerge = 1;

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
    "The Legion",
    "The Bloodhounds",
    "The Dreadnoughts",
    "The Strikers",
    "The Juggernauts",
    "The Outriders",
    "The Harbingers",
    "Under the Radar",
    "The Inside Job",
    "The Illusionists",
    "Smoke & Mirrors",
    "The Power Brokers",
    "The Storytellers",
    "The Demon's Gambit",
    "The Mad Hatters",
    "The Townsfolk Tribunal",
    "The Evil Twins",
    "The Saints",
    "The Scarlet Mark",
    "The Poisoners",
    "The Lunatics",
    "The Empaths",
    "The Fortune Tellers",
    "The Ravenkeepers",
    "The No Dashii Society",
    "The Witches",
    "The Undertakers",
    "The Minions",
    "The Shabaloth Coven",
    "The Oracles",
    "The Town Square Syndicate",
    "The Imps",
    "The Phantom Court",
    "The Vortox",
    "The Outsiders",
    "The Goons"
  ];
  useOnlyCustomEvents = false;
  customRandomAllianceNames = [];
  tribeSize = 10;
  mergeAt = 12;
  numberedAlliances = true;
  numberedTribe1 = 1;
  numberedTribe2 = 1;
  numberedMerge = 1;
};

export const removeFromAlliance = (loser) => {
  alliances = alliances.map(alliance => ({
    ...alliance,
    members: alliance.members.filter(member => member !== loser),
  })).filter(alliance => alliance.members.length > 1);
}

const populateTribes = (players, updateResults) => {
  const tribe1 = players.slice(0, tribeSize);
  const tribe2 = players.slice(tribeSize);

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
        let baseChance = (other.likeability / 10) * 0.9;
        let relationshipValue;

        if (Math.random() < baseChance) {
          relationshipValue = Math.floor(Math.random() * 3) + 1;
        } else {
          relationshipValue = Math.floor(Math.random() * 4) - 3;
        }
        player.relationships[other.name] = relationshipValue;
      }
    });
  });
};

const detectDrasticRelationships = (tribe, updateResults) => {
  let drasticEvents = [];
  let seenTargets = new Set();
  let relationshipPairs = [];

  drasticEvents.push({ type: "relationship" });

  tribe.forEach(player1 => {
    let worstTarget = null;
    let worstScore = Infinity;

    tribe.forEach(player2 => {
      if (player1 !== player2) {
        let score = player1.relationships[player2.name] || 0;

        if (score <= -4 && score < worstScore && !seenTargets.has(player2.name)) {
          worstScore = score;
          worstTarget = player2;
        }
      }
    });

    if (worstTarget) {
      seenTargets.add(worstTarget.name);
      relationshipPairs.push({ player1, player2: worstTarget, score: worstScore });
    }
  });

  if (relationshipPairs.length < 2) {
    tribe.forEach(player1 => {
      if (!relationshipPairs.some(pair => pair.player1 === player1)) {
        let worstTarget = null;
        let worstScore = Infinity;

        tribe.forEach(player2 => {
          if (player1 !== player2) {
            let score = player1.relationships[player2.name] || 0;

            if (score <= -2 && score < worstScore && !seenTargets.has(player2.name)) {
              worstScore = score;
              worstTarget = player2;
            }
          }
        });

        if (worstTarget) {
          seenTargets.add(worstTarget.name);
          relationshipPairs.push({ player1, player2: worstTarget, score: worstScore });
        }
      }
    });

    relationshipPairs = relationshipPairs.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  relationshipPairs.forEach(({ player1, player2 }) => {
    let messages = [
      `${player1.name} wants to target ${player2.name}.`,
      `${player1.name} sees ${player2.name} as a major threat.`,
      `${player1.name} is actively working against ${player2.name}.`,
      `${player1.name} has made it clear they don’t trust ${player2.name}.`,
      `${player1.name} wants ${player2.name} out before they get too powerful.`,
      `${player1.name} has made ${player2.name} their number one target.`,
      `${player1.name} cannot stand being around ${player2.name}.`,
      `${player1.name} thinks ${player2.name} is too arrogant.`,
      `${player1.name} is determined to outplay ${player2.name}.`,
      `${player1.name} refuses to lose to ${player2.name}.`,
      `${player1.name} is trying to rally people against ${player2.name}.`,
    ];

    drasticEvents.push({
      type: "event",
      message: `<span class="text-red-400">${messages[Math.floor(Math.random() * messages.length)]}</span>`,
      images: [player1.image, player2.image],
    });
  });

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

  if (Math.random() < 0.375) {
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
  const positiveEvents = [
    "Player1 and Player2 bonded over a shared experience.",
    "Player1 helped Player2 through a tough time.",
    "Player1 and Player2 formed a strong trust.",
    "Player1 stood up for Player2 in a conflict.",
    "Player1 and Player2 had a deep strategic conversation.",
    "Player1 and Player2 made a secret alliance.",
    "Player1 taught Player2 a survival skill.",
    "Player1 and Player2 enjoyed a relaxing moment together.",
    "Player1 and Player2 promised to always have each other's back.",
    "Player1 saved Player2 from getting caught searching for an idol.",
    "Player1 reassured Player2 when they were feeling uncertain about their game.",
    "Player1 and Player2 discovered they share a mutual friend outside the game!",
    "Player1 gifted Player2 their extra portion of rice.",
    "Player1 and Player2 developed a secret handshake.",
    "Player1 and Player2 shared a heartfelt conversation by the fire.",
    "Player1 saved Player2 from a dangerous situation.",
    "Player1 and Player2 laughed over an inside joke no one else understood.",
    "Player1 and Player2 worked together to find food for the tribe.",
    "Player1 and Player2 shared a late-night strategy talk under the stars.",
    "Player1 and Player2 planned a future move together.",
    "Player1 and Player2 agreed to have each other's backs.",
    "Player1 and Player2 played a prank on the rest of the tribe, laughing together.",
    "Player1 and Player2 sang together while working around camp.",
    "Player1 and Player2 enjoyed a moment of peace away from the tribe."
  ];
  
  const negativeEvents = [
    "Player1 and Player2 had a heated argument!",
    "Player1 and Player2 got into a physical altercation.",
    "Player1 stole food from Player2, causing distrust.",
    "Player1 accused Player2 of playing both sides.",
    "Player1 and Player2 clashed over leadership decisions.",
    "Player1 and Player2 had an awkward moment after a failed alliance.",
    "Player1 spread a rumor about Player2.",
    "Player1 ignored Player2 in an important strategy discussion.",
    "Player1 threw Player2's name out as a target, causing tensions.",
    "Player1 and Player2 argued over who was slacking in camp.",
    "Player1 made a sarcastic remark that offended Player2.",
    "Player1 accused Player2 of throwing the challenge.",
    "Player1 dismissed Player2's game plan, making them feel excluded.",
    "Player1 tried to manipulate Player2, but it backfired.",
    "Player1 warned others not to trust Player2.",
    "Player1 and Player2 got into a petty fight over sleeping arrangements.",
    "Player1 criticized the challenge performance of Player2 in front of the whole tribe.",
    "Player1 called out Player2 for playing a weak game.",
    "Player1 and Player2 got into a public shouting match.",
    "Player1 called out Player2 for being lazy at camp.",
    "Player1 spread a lie about Player2 to the rest of the tribe.",
    "Player1 openly questioned the loyalty of Player2.",
    "Player1 rolled their eyes at Player2 during a tribe discussion.",
    "Player1 purposely left Player2 out of a big decision.",
    "Player1 let slip that they didn't trust Player2.",
    "Player1 and Player2 had a passive-aggressive conversation."
  ];

  const haveCustoms = customEvents && customEvents.length > 0;

  if (haveCustoms && useOnlyCustomEvents) {
    const randomCustomEvent = customEvents[Math.floor(Math.random() * customEvents.length)];
    eventType = randomCustomEvent.type;
    severity = randomCustomEvent.severity;
    message = randomCustomEvent.description;
    numPlayers = randomCustomEvent.numPlayers;
  } else {
    const genericPool = [
      ...positiveEvents.map((text) => ({
        kind: "generic",
        eventType: "positive",
        text,
      })),
      ...negativeEvents.map((text) => ({
        kind: "generic",
        eventType: "negative",
        text,
      })),
    ];

    let pool = genericPool;
    if (haveCustoms) {
      pool = pool.concat(
        customEvents.map((ce) => ({
          kind: "custom",
          eventType: ce.type,
          custom: ce,
        }))
      );
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    if (chosen.kind === "custom") {
      const ce = chosen.custom;
      eventType = ce.type;
      severity = ce.severity;
      message = ce.description;
      numPlayers = ce.numPlayers;
    } else {
      eventType = chosen.eventType;
      severity = Math.floor(Math.random() * 5) + 1;
      message = chosen.text;
      numPlayers = 2;
    }
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

const manageAlliances = (tribe, tribeType) => {
  let newAlliances = [];
  let dissolvedAlliances = [];
  let existingAlliances2 = [...alliances];

  let tribeMembersInAlliances = alliances.some(alliance =>
    alliance.members.some(member => tribe.includes(member))
  );

  const baseThreshold = 0.7; // **Base chance of an alliance forming**
  const maxAlliancesAllowed = Math.max(5, Math.floor(tribeSize / 4)); // **More allowed in bigger tribes**

  let finalThreshold = baseThreshold;
  let allianceThreshold = Math.min(0.9999, finalThreshold);

  if(existingAlliances2.length > maxAlliancesAllowed){
    allianceThreshold = 1;
  }

  tribe.forEach(player => {
    if(newAlliances.length >= 2){
      allianceThreshold = 0.99;
    }
    if(newAlliances.length === 0 && existingAlliances2.length === 0){allianceThreshold === 0.5}
    let playerAllianceCounts = {};
    alliances.forEach(alliance => {
      alliance.members.forEach(member => {
        playerAllianceCounts[member.name] = (playerAllianceCounts[member.name] || 0) + 1;
      });
    });
    newAlliances.forEach(alliance => {
      alliance.members.forEach(member => {
        playerAllianceCounts[member.name] = (playerAllianceCounts[member.name] || 0) + 1;
      });
    });
    let tribeMembersInNewAlliances = newAlliances.some(alliance =>
      alliance.members.some(member => tribe.includes(member))
    );
    if(Math.random() > allianceThreshold || (!tribeMembersInNewAlliances && !tribeMembersInAlliances)){

    let potentialMembers = tribe.filter(
      other => player !== other && player.relationships[other.name] >= 1 && (playerAllianceCounts[other.name] || 0) < 2
    );

    potentialMembers.sort((a, b) => (playerAllianceCounts[a.name] || 0) - (playerAllianceCounts[b.name] || 0));
      while (potentialMembers.length > 7) {
        potentialMembers.splice(Math.floor(Math.random() * potentialMembers.length), 1);
      }

    if (potentialMembers.length >= 1) {
      const members = [player, ...potentialMembers];

      const isDuplicate = existingAlliances2.some(existingAlliance =>
        existingAlliance.members.length === members.length &&
        existingAlliance.members.every(member => members.includes(member))
      );

      const isSubset = existingAlliances2.some(existingAlliance =>
        members.length < existingAlliance.members.length &&
        members.every(member => existingAlliance.members.includes(member))
      );

      let baseStrength = potentialMembers.reduce((sum, p) => sum + player.relationships[p.name], 0) / potentialMembers.length;

      let scaledStrength = Math.round(((baseStrength + 5) / 10) * 9 + 1);

      scaledStrength = Math.max(1, Math.min(10, scaledStrength));

      let isTooSimilar = existingAlliances2.some(existingAlliance => {
        const commonMembers = existingAlliance.members.filter(member => members.includes(member)).length;
        return commonMembers > 2 || (members.length < 4 && commonMembers > 1);
      });
      if(!isTooSimilar){
        isTooSimilar = newAlliances.some(existingAlliance => {
          const commonMembers = existingAlliance.members.filter(member => members.includes(member)).length;
          return commonMembers > 2 || (members.length < 4 && commonMembers > 1);
        });
      }

      if (!isDuplicate && !isTooSimilar && !isSubset) {

        let allianceName;

        if(numberedAlliances){
          let tempNum = tribeType === 0 ? numberedTribe1++ : tribeType === 1 ? numberedTribe2++ : numberedMerge++;
          let tempName = tribeType === 0 ? tribeNames.tribe1 : tribeType === 1 ? tribeNames.tribe2 : tribeNames.merge;
          allianceName = `${tempName} - Alliance ${tempNum}`;
        } else if(customRandomAllianceNames.length > 0) {
          const randomIndex = Math.floor(Math.random() * customRandomAllianceNames.length);
          allianceName = customRandomAllianceNames[randomIndex];
          customRandomAllianceNames.splice(randomIndex, 1);
        } else {
          const randomIndex = Math.floor(Math.random() * randomAllianceNames.length);
          allianceName = randomAllianceNames[randomIndex];
          randomAllianceNames.splice(randomIndex, 1);
        }

        newAlliances.push({
          name: allianceName,
          members: [player, ...potentialMembers].sort((a, b) => a.name.localeCompare(b.name)),
          strength: scaledStrength,
        });
      }
    }
  }
  });

  alliances = alliances.concat(newAlliances);

  let existingAlliances = [];
  let seenAlliances = new Set();
  alliances.forEach(alliance => {
    let memberNames = alliance.members.map(p => p.name).sort().join(",");
    
    if (seenAlliances.has(memberNames)) {
      dissolvedAlliances.push(alliance);
      return;
    }
    if(alliance.members.length === tribe.length && alliance.members.some(member => tribe.includes(member))){
      dissolvedAlliances.push(alliance);
      return;
    }
    seenAlliances.add(memberNames);

    alliance.strength += Math.floor(Math.random() * 3) - 1;
    alliance.strength = Math.max(1, Math.min(10, alliance.strength));

    const isInCurrentTribe = alliance.members.some(member => tribe.includes(member));

    let isFullyContained = alliances.some(existingAlliance =>
      existingAlliance !== alliance &&
      alliance.members.every(member => existingAlliance.members.includes(member))
    );
    if(alliance.members.length === 2){isFullyContained = false;}
  
    if (isFullyContained && isInCurrentTribe) {
      dissolvedAlliances.push(alliance);
    } else if (alliance.strength <= 4 && Math.random() < 0.5 && isInCurrentTribe) {
      if (newAlliances.includes(alliance)) {
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







/*const manageAlliances = (tribe) => {
  let newAlliances = [];
  let dissolvedAlliances = [];
  let existingAlliances2 = [...alliances];

  // **Limit total alliances & formation per round**
  const maxTotalAlliances = 7;
  const maxNewAlliancesPerRound = 3;

  // **Dynamically adjust the chance of new alliances forming**
  let allianceThreshold = 0.95 - (alliances.length / (maxTotalAlliances * 2));
  if (alliances.length >= maxTotalAlliances) {
    allianceThreshold = 0.9999; // Block new alliances if at cap
  }

  // **Track how many alliances each player is in**
  let playerAllianceCounts = {};
  alliances.forEach(alliance => {
    alliance.members.forEach(member => {
      playerAllianceCounts[member.name] = (playerAllianceCounts[member.name] || 0) + 1;
    });
  });

  let alliancesFormed = 0;

  tribe.forEach(player => {
    if (alliancesFormed >= maxNewAlliancesPerRound) return;

    if (Math.random() > allianceThreshold) {
      let potentialMembers = tribe.filter(other =>
        player !== other &&
        player.relationships[other.name] >= 2 && // **Mutual strong bonds**
        (playerAllianceCounts[other.name] || 0) < 2 // **Favors players not already in many alliances**
      );

      // **Prioritize players in fewer alliances**
      potentialMembers.sort((a, b) => (playerAllianceCounts[a.name] || 0) - (playerAllianceCounts[b.name] || 0));

      // **Create alliance of varying size (between 2-6 members)**
      let allianceSize = 2 + Math.floor(Math.random() * 5);
      potentialMembers = potentialMembers.slice(0, allianceSize - 1);

      if (potentialMembers.length >= 1) {
        const members = [player, ...potentialMembers];

        // **Ensure new alliances are not subsets of existing ones**
        const isDuplicate = existingAlliances2.some(existingAlliance =>
          existingAlliance.members.length === members.length &&
          existingAlliance.members.every(member => members.includes(member))
        );

        const isSubset = existingAlliances2.some(existingAlliance =>
          members.length < existingAlliance.members.length &&
          members.every(member => existingAlliance.members.includes(member))
        );

        let baseStrength = potentialMembers.reduce((sum, p) => sum + player.relationships[p.name], 0) / potentialMembers.length;
        let scaledStrength = Math.round(((baseStrength + 5) / 10) * 9 + 1);
        scaledStrength = Math.max(1, Math.min(10, scaledStrength));

        if (!isDuplicate && !isSubset) {
          let allianceName;
          if (customRandomAllianceNames.length > 0) {
            const randomIndex = Math.floor(Math.random() * customRandomAllianceNames.length);
            allianceName = customRandomAllianceNames[randomIndex];
            customRandomAllianceNames.splice(randomIndex, 1);
          } else {
            const randomIndex = Math.floor(Math.random() * randomAllianceNames.length);
            allianceName = randomAllianceNames[randomIndex];
            randomAllianceNames.splice(randomIndex, 1);
          }

          let sortedMembers = members.sort((a, b) => a.name.localeCompare(b.name));
          newAlliances.push({
            name: allianceName,
            members: sortedMembers,
            strength: scaledStrength,
          });

          // **Update the alliance count for each player**
          sortedMembers.forEach(member => {
            playerAllianceCounts[member.name] = (playerAllianceCounts[member.name] || 0) + 1;
          });

          alliancesFormed++;
        }
      }
    }
  });

  alliances = alliances.concat(newAlliances);

  // **Dissolving Phase (Same as before)**
  let existingAlliances = [];
  let seenAlliances = new Set();
  alliances.forEach(alliance => {
    let memberNames = alliance.members.map(p => p.name).sort().join(",");
    
    if (seenAlliances.has(memberNames)) {
      dissolvedAlliances.push(alliance);
      return;
    }
    seenAlliances.add(memberNames);

    alliance.strength += Math.floor(Math.random() * 3) - 1;
    alliance.strength = Math.max(1, Math.min(10, alliance.strength));

    const isInCurrentTribe = alliance.members.some(member => tribe.includes(member));

    let isFullyContained = alliances.some(existingAlliance =>
      existingAlliance !== alliance &&
      alliance.members.every(member => existingAlliance.members.includes(member))
    );
    if (alliance.members.length === 2) { isFullyContained = false; }

    if (isFullyContained && isInCurrentTribe) {
      dissolvedAlliances.push(alliance);
    } else if (alliance.strength <= 4 && Math.random() < 0.5 && isInCurrentTribe) {
      if (newAlliances.includes(alliance)) {
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
};*/





export const simulate = (players, updateResults, customEvents, useOnlyCustom, tsize, tribes, advantages, customAllianceNames, mergeNum, useNumberedAlliances) => {
  let episodes = [];
  count = tsize*2;
  tribeNames = tribes;
  useOnlyCustomEvents = useOnlyCustom;
  tribeSize = tsize;
  mergeAt = mergeNum;
  numberedAlliances = useNumberedAlliances;
  customRandomAllianceNames = customAllianceNames;
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

const getAllianceTargets = (tribe, alliances, updateResults, immune) => {
  let allianceTargets = [];

  let filteredAlliances = alliances.filter(alliance => 
    alliance.members.some(member => tribe.includes(member))
  );

  filteredAlliances.forEach(alliance => {
    let bestTarget = null;
    let lowestRelationship = Infinity;

    alliance.members.forEach(member => {
      tribe.forEach(candidate => {
        if (
          candidate !== member &&
          !alliance.members.includes(candidate)
        ) {
          if(immune == null || immune != candidate.name){
            let relationshipScore = member.relationships[candidate.name] || 0;

            if (relationshipScore < lowestRelationship) {
              lowestRelationship = relationshipScore;
              bestTarget = candidate;
            }
          }
        }
      });
    });

    if (bestTarget) {
      updateResults({
        type: "allianceTarget",
        alliance: alliance,
        message: `<span class="text-blue-400 font-bold">${alliance.name}</span><span class="font-normal"> alliance plans to target </span><span class="text-red-400 font-bold">${bestTarget.name}</span>.`,
      });
    }
  });
};

/**
 * Handles the pre-merge phase of the game.
 * @param {Function} updateResults - Callback to update the game status.
 */
const handlePreMergePhase = (updateResults, customEvents) => {
  if (tribes[0].length + tribes[1].length === mergeAt) {
    mergeTribes(updateResults);
    handlePostMergePhase(updateResults, customEvents);
  } else {
      const relevantAlliances1 = alliances.filter(alliance =>
        alliance.members.some(member => tribes[0].some(tribeMember => tribeMember.name === member.name))
      );
      updateResults(
        { type: "tribe", title: tribeNames.tribe1, alliances: relevantAlliances1, members: tribes[0].sort((a, b) => a.name.localeCompare(b.name)).map(member => ({
          ...member,
          relationships: { ...member.relationships },
        })) }
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
      const alliances1 = manageAlliances(tribes[0], 0);

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

      const relevantAlliances2 = alliances.filter(alliance =>
        alliance.members.some(member => tribes[1].some(tribeMember => tribeMember.name === member.name))
      );

      updateResults(
        { type: "tribe", title: tribeNames.tribe2, alliances: relevantAlliances2, members: tribes[1].sort((a, b) => a.name.localeCompare(b.name)).map(member => ({
          ...member,
          relationships: { ...member.relationships },
        })) }
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
      const alliances2 = manageAlliances(tribes[1], 1);

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

      /*if (alliances2.allAlliances != null) {
        if (alliances2.allAlliances.length > 0) {
          updateResults({
            type: "alliance",
            title: "Current Alliances",
            alliances: alliances2.allAlliances,
          });
        }
      }*/

      winner = tribalImmunity(tribes);
      tribes[winner].forEach((player) => player.teamWins++);
      loser = winner === 0 ? 1 : 0;
      updateResults({ type: "immunity", message: `${winner + 1 === 1 ? tribeNames.tribe1 : tribeNames.tribe2} wins immunity! So, ${winner + 1 === 2 ? tribeNames.tribe1 : tribeNames.tribe2} will be going to tribal council`, members: [...tribes[loser]] });

      updateResults({
        type: "idols",
        idols: {tribe1: tribeIdols.tribe1, tribe2: tribeIdols.tribe2, merge: tribeIdols.merge},
      });
      
      detectDrasticRelationships(tribes[loser], updateResults);
      getAllianceTargets(tribes[loser], alliances, updateResults);

      state = "tribal";
      const { voteIndex: out, sortedVotes: sortedVotes, voteDetails, voteSummary, idols } = voting(tribes[loser], alliances, false, -1, usableAdvantages, tribeIdols);
      tribeIdols = idols;
      if (out !== undefined) {
          const votedout = tribes[loser].splice(out, 1)[0];
          votedout.placement = count;
          count--;
          finalPlacements.push(votedout);
          const wasEliminatedByRocks = voteSummary.some(msg => msg.toLowerCase().includes("rocks"));
          const wasEliminatedByFire = voteSummary.some(msg => msg.toLowerCase().includes("firemaking"));
          updateResults({
            type: "voting-summary",
            message: voteSummary,
          });
          updateResults({
            type: "event",
            message: wasEliminatedByRocks 
              ? `${votedout.name} is eliminated by rocks!` 
              : wasEliminatedByFire ? `${votedout.name} is eliminated in fire!` : `${votedout.name} voted out by a vote of ${sortedVotes}`,
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
    const relevantAlliances1 = alliances.filter(alliance =>
      alliance.members.some(member => tribes[0].some(tribeMember => tribeMember.name === member.name))
    );
    updateResults(
      { type: "tribe", title: tribeNames.merge, alliances: alliances, members: tribes[0].sort((a, b) => a.name.localeCompare(b.name)).map(member => ({
        ...member,
        relationships: { ...member.relationships }
      })) },
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
        const alliances1 = manageAlliances(tribes[0], 2);

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
    
        /*if (alliances1.allAlliances != null) {
          if (alliances1.allAlliances.length > 0) {
            updateResults({
              type: "alliance",
              title: "Current Alliances",
              alliances: alliances1.allAlliances,
            });
          }
        }*/

        winner = individualImmunity(tribe);
        const immune = tribe[winner];
        immune.immunities++;
        updateResults({
          type: "immunity",
          message: `${immune.name} wins individual immunity!`,
          members: [immune] 
        });

        updateResults({
          type: "idols",
          idols: {tribe1: tribeIdols.tribe1, tribe2: tribeIdols.tribe2, merge: tribeIdols.merge},
        });

        detectDrasticRelationships(tribes[0], updateResults);
        getAllianceTargets(tribes[0], alliances, updateResults, immune.name);

        state = "tribal";
        const tribecopy = [...tribe];
        const { voteIndex: out, sortedVotes: sortedVotes, voteDetails, voteSummary, idols } = voting(tribecopy, alliances, true, winner, usableAdvantages, tribeIdols);
        tribeIdols = idols;
        if (out !== undefined) {
            const votedout = tribecopy.splice(out, 1)[0];
            votedout.placement = count;
            count--;
            finalPlacements.push(votedout);
            tribes[0] = tribecopy;
            const wasEliminatedByRocks = voteSummary.some(msg => msg.toLowerCase().includes("rocks"));
            const wasEliminatedByFire = voteSummary.some(msg => msg.toLowerCase().includes("firemaking"));
            updateResults({
              type: "voting-summary",
              message: voteSummary,
            });
            updateResults({
              type: "event",
              message: wasEliminatedByRocks 
                ? `${votedout.name} is eliminated by rocks!` 
                : wasEliminatedByFire ? `${votedout.name} is eliminated in fire!` : `${votedout.name} voted out by a vote of ${sortedVotes}`,
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
        finalPlacements.push(tribes[0][0], tribes[0][1], tribes[0][2]);
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