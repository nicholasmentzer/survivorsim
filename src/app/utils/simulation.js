import { voting, votingWinner, individualImmunity, tribalImmunity, getVoteResults, determineVotedOut } from "./simulator";
import { finalPlacements } from "../page";

const makeTribeKey = (tribeIndex) => `tribe${tribeIndex + 1}`;

const makeDefaultTribeNames = (n) => {
  const names = { merge: "Merge Tribe" };
  for (let i = 0; i < n; i++) names[makeTribeKey(i)] = `Tribe ${i + 1}`;
  return names;
};

const makeTribeMap = (n, value) => {
  const map = { merge: value };
  for (let i = 0; i < n; i++) map[makeTribeKey(i)] = value;
  return map;
};

let tribes = [];
let merged = false;
let winner = -1;
let loser = -1;
let state = "configure";
let week = 1;
let alliances = [];
let allianceIdCounter = 1;
let numTribes = 2;
let tribeNames = makeDefaultTribeNames(2);
let tribeIdols = makeTribeMap(2, null);
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
let swapAt = null;
let swapped = false;
let count = 20;
let numberedAlliances = true;
let numberedAllianceCounters = makeTribeMap(2, 1);

// Used only for presentation: when displaying alliance targets, we can prefer
// a "driver" only if that driver ALSO has the same personal target.
// Key: actorName -> targetName
let personalTargetsByActor = {};

export const resetSimulation = () => {
  tribes = [];
  merged = false;
  winner = -1;
  loser = -1;
  state = "configure";
  week = 1;
  alliances = [];
  allianceIdCounter = 1;
  numTribes = 2;
  tribeNames = makeDefaultTribeNames(2);
  tribeIdols = makeTribeMap(2, null);
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
  swapAt = null;
  swapped = false;
  numberedAlliances = true;
  numberedAllianceCounters = makeTribeMap(2, 1);
  personalTargetsByActor = {};
};

const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const snapshotIdols = (idolsMap) => {
  const src = idolsMap || {};
  const out = {};
  Object.entries(src).forEach(([key, player]) => {
    if (!player) {
      out[key] = null;
      return;
    }
    out[key] = {
      name: player.name,
      image: player.image,
      tribeId: player.tribeId,
      originalTribeId: player.originalTribeId,
      hasIdol: !!player.hasIdol,
    };
  });
  return out;
};

const tribeSwap = (updateResults) => {
  if (numTribes <= 1) return;
  const allPlayers = tribes.flat().filter(Boolean);
  if (allPlayers.length <= 1) return;

  // Preserve the "one idol per tribe" invariant by seeding idol holders
  // into distinct tribes before distributing everyone else.
  const idolHolders = Object.values(tribeIdols)
    .filter((p) => !!p)
    .filter((p) => allPlayers.some((x) => x?.name === p.name));

  const remaining = allPlayers.filter(
    (p) => !idolHolders.some((h) => h?.name === p.name)
  );

  shuffleInPlace(idolHolders);
  shuffleInPlace(remaining);

  const tribeIndices = shuffleInPlace(Array.from({ length: numTribes }, (_, i) => i));
  const newTribes = Array.from({ length: numTribes }, () => []);

  idolHolders.slice(0, numTribes).forEach((holder, idx) => {
    const targetTribe = tribeIndices[idx] ?? idx;
    newTribes[targetTribe].push(holder);
  });

  // Balance distribution: always fill the currently-smallest tribe.
  remaining.forEach((player) => {
    let bestIdx = 0;
    for (let i = 1; i < newTribes.length; i++) {
      if (newTribes[i].length < newTribes[bestIdx].length) bestIdx = i;
    }
    newTribes[bestIdx].push(player);
  });

  tribes = newTribes;

  // Rebuild tribeIdols mapping to match the new tribes (still max 1 per tribe).
  const nextIdols = makeTribeMap(numTribes, null);
  for (let i = 0; i < numTribes; i++) {
    const tribeKey = makeTribeKey(i);
    const holder = (tribes[i] || []).find((p) => p?.hasIdol);
    if (holder) nextIdols[tribeKey] = holder;
  }
  tribeIdols = nextIdols;

  updateResults({
    type: "event",
    message: "Tribe swap! Everyone draws new buffs and tribes are shuffled.",
  });
};

const getAlliancesForTribe = (tribe) => {
  // Alliances can transcend swaps, but for a given tribe's camp/council,
  // only show/use the members currently on that tribe.
  const tribeByName = new Map((tribe || []).filter(Boolean).map((p) => [p.name, p]));
  const tribeNameSet = new Set(tribeByName.keys());

  return (alliances || [])
    .map((alliance) => {
      // IMPORTANT: use the *current tribe's* player objects so downstream
      // code that uses object identity (e.g., includes(voter)) still works
      // after swaps/merges.
      const memberNames = (alliance?.members || []).map((m) => m?.name).filter(Boolean);
      const membersInTribe = memberNames
        .filter((name) => tribeNameSet.has(name))
        .map((name) => tribeByName.get(name))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      return { ...alliance, members: membersInTribe };
    })
    .filter((a) => (a.members || []).length >= 2);
};

// For display (e.g., "View Alliances" on a tribe), include alliances that have
// at least one member currently on this tribe, but keep full membership so we
// can grey out off-tribe members after a swap.
const getAlliancesTouchingTribe = (tribe) => {
  const tribeNameSet = new Set((tribe || []).map((p) => p?.name).filter(Boolean));

  // Canonicalize members to the current, in-game player objects by name.
  // This keeps colors/avatars consistent even if an alliance stored a stale
  // player reference from before a swap.
  const playerByName = new Map(
    (tribes || []).flat().filter(Boolean).map((p) => [p.name, p])
  );

  return (alliances || [])
    // Only show alliances that have at least 2 members currently on this tribe.
    // This prevents "ghost" alliances after swaps where only 1 member remains.
    .filter((alliance) => {
      const inTribeCount = (alliance?.members || []).reduce(
        (sum, m) => sum + (tribeNameSet.has(m?.name) ? 1 : 0),
        0
      );
      return inTribeCount >= 2;
    })
    .map((alliance) => ({
      ...alliance,
      members: (alliance?.members || [])
        .map((m) => playerByName.get(m?.name) || m)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
};

export const removeFromAlliance = (loser) => {
  const loserName = loser?.name;
  if (!loserName) {
    return { dissolvedAlliances: [], allAlliances: alliances };
  }

  const dissolvedAlliances = [];

  alliances = (alliances || [])
    .map((alliance) => {
      const beforeMembers = alliance?.members || [];
      const hadLoser = beforeMembers.some((m) => m?.name === loserName);
      if (!hadLoser) return alliance;

      const nextMembers = beforeMembers.filter((m) => m?.name !== loserName);
      if (nextMembers.length <= 1) {
        dissolvedAlliances.push(alliance);
      }

      return { ...alliance, members: nextMembers };
    })
    .filter((alliance) => (alliance?.members || []).length > 1);

  return { dissolvedAlliances, allAlliances: alliances };
}

const populateTribes = (players) => {
  const haveTribeIds = (players || []).every((p) => Number.isFinite(p?.tribeId));
  if (haveTribeIds) {
    tribes = Array.from({ length: numTribes }, (_, i) =>
      (players || []).filter((p) => p.tribeId === i + 1)
    );
  } else {
    // Fallback: split by ordering
    tribes = Array.from({ length: numTribes }, (_, i) =>
      (players || []).slice(i * tribeSize, (i + 1) * tribeSize)
    );
  }

  // If there's only one tribe, treat the season as "merged" from the start
  // (no 'tribes are merged' banner in episode 1, and the merge tribe name is used).
  if (numTribes <= 1) {
    tribes = [tribes[0] || [], []];
    merged = true;
  } else {
    merged = false;
  }
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

  // Reset personal-target hints for this cycle.
  personalTargetsByActor = {};

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
      `${player1.name} wants ${player2.name} out before they get too powerful.`,
      `${player1.name} has made ${player2.name} their number one target.`,
      `${player1.name} cannot stand being around ${player2.name}.`,
      `${player1.name} is trying to rally people against ${player2.name}.`,
      `${player1.name} believes their path to the end is blocked unless ${player2.name} goes tonight.`,
      `${player1.name} thinks removing ${player2.name} will open up the game.`,
      `${player1.name} is planting subtle seeds to get others to consider voting out ${player2.name}.`,
      `${player1.name} is quietly collecting votes against ${player2.name}.`,
      `${player1.name} thinks now is the perfect time to blindside ${player2.name}.`,
      `${player1.name} sees this as the last chance to get rid of ${player2.name}.`,
      `${player1.name} is whispering doubts about ${player2.name} to anyone who will listen.`,
      `${player1.name} is presenting the vote for ${player2.name} as 'what's best for the tribe'.`,
      `${player1.name} is trying to convince others that voting ${player2.name} out is the safe move.`,
      `${player1.name} is pitching a “clean, easy vote” by targeting ${player2.name}.`,
      `${player1.name} is telling people that keeping ${player2.name} around would be a mistake.`,
      `${player1.name} is framing ${player2.name} as the root of all the chaos.`,
    ];

    drasticEvents.push({
      type: "target",
      actor: { name: player1.name, image: player1.image },
      target: { name: player2.name, image: player2.image },
      message: messages[Math.floor(Math.random() * messages.length)],
    });

    // Track personal targets (used only for picking a display driver).
    // We only prefer an actor if the alliance target matches this exact target.
    if (player2?.name && player1?.name) {
      personalTargetsByActor[player1.name] = player2.name;
    }
  });

  drasticEvents.forEach(event => updateResults(event));
};

const findIdol = (tribe, tribeName, merged) => {
  if (!usableAdvantages.includes("immunityIdol")) return;
  if (!merged) {
    if (tribeIdols[tribeName]) return;
  }
  else {
    if (Object.values(tribeIdols).some((v) => v != null)) return null;
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
    "Player1 and Player2 enjoyed a moment of peace away from the tribe.",
    "Player1 and Player2 shared a quiet smile while working at camp.",
    "Player1 let Player2 have the last bite of food.",
    "Player1 and Player2 found themselves laughing at the same joke.",
    "Player1 complimented Player2's effort in a small task.",
    "Player1 and Player2 exchanged a knowing glance during a conversation.",
    "Player1 listened to Player2 vent about the day.",
    "Player1 and Player2 discovered a shared hobby.",
    "Player1 offered Player2 a spot by the fire.",
    "Player1 quietly helped Player2 with a chore.",
    "Player1 and Player2 worked side by side in comfortable silence.",
    "Player1 and Player2 shared a brief moment of understanding.",
    "Player1 noticed Player2 was struggling and offered encouragement.",
    "Player1 and Player2 agreed on a small camp decision.",
    "Player1 and Player2 found a rhythm working together.",
    "Player1 and Player2 exchanged a subtle nod of respect.",
    "Player1 and Player2 shared a small inside joke.",
    "Player1 quietly supported Player2 during a tough moment.",
    "Player1 and Player2 noticed they have similar habits.",
    "Player1 and Player2 both enjoyed a peaceful moment away from the group.",
    "Player1 and Player2 found themselves on the same page about a plan.",
    "Player1 and Player2 shared a look of amusement at someone else's antics.",
    "Player1 and Player2 shared a brief, friendly conversation.",
    "Player1 and Player2 both noticed something funny and smiled.",
    "Player1 and Player2 worked together to solve a minor problem.",
    "Player1 and Player2 both enjoyed a break from the group together.",
    "Player1 and Player2 found a shared interest in a camp activity.",
    "Player1 and Player2 both supported each other in a small way.",
    "Player1 and Player2 shared a moment of mutual respect.",
    "Player1 and Player2 felt understood by each other.",
    "Player1 and Player2 shared a quiet laugh about something only they noticed.",
    "Player1 and Player2 both felt more comfortable after a short chat."
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
    "Player1 and Player2 had a passive-aggressive conversation.",
    "Player1 and Player2 had a brief misunderstanding.",
    "Player1 accidentally interrupted Player2 while talking.",
    "Player1 forgot to help Player2 with a chore.",
    "Player1 made a comment that Player2 found mildly annoying.",
    "Player1 didn't laugh at Player2's joke.",
    "Player1 and Player2 had a moment of awkward silence.",
    "Player1 took the last portion of food Player2 wanted.",
    "Player1 and Player2 disagreed on where to put something at camp.",
    "Player1 forgot Player2's name for a moment.",
    "Player1 and Player2 had a minor clash over sleeping spots.",
    "Player1 dismissed Player2's idea without meaning to.",
    "Player1 accidentally splashed Player2 with water.",
    "Player1 and Player2 had a small disagreement about the fire.",
    "Player1 forgot to include Player2 in a quick discussion.",
    "Player1 and Player2 had a brief, awkward exchange.",
    "Player1 and Player2 both felt slightly annoyed after a short conversation.",
    "Player1 and Player2 disagreed on a trivial matter.",
    "Player1 and Player2 both felt left out by the other.",
    "Player1 and Player2 had a small miscommunication.",
    "Player1 and Player2 had a moment of silent frustration.",
    "Player1 and Player2 both felt awkward after a failed joke."
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

const manageAlliances = (tribe, tribeKey) => {
  let newAlliances = [];
  let dissolvedAlliances = [];
  let existingAlliances2 = [...alliances];

  const getMembersInTribe = (alliance) =>
    (alliance?.members || []).filter((m) => tribe.includes(m));

  // Late-game: if there are already lots of small alliances, strongly
  // discourage *new* 2-person alliances from forming (but don't forbid it).
  const tribeCountForLateGame = (tribe || []).length;
  const alliancesInThisTribeNow = (alliances || []).filter(
    (a) => getMembersInTribe(a).length >= 2
  );
  const pairAlliancesInThisTribeNow = alliancesInThisTribeNow.filter(
    (a) => getMembersInTribe(a).length === 2
  ).length;
  const lateGameTooManySmallAlliances =
    tribeCountForLateGame <= 7 &&
    alliancesInThisTribeNow.length >= Math.max(3, tribeCountForLateGame - 2) &&
    pairAlliancesInThisTribeNow >= Math.max(2, Math.floor(tribeCountForLateGame / 2));

  const jaccardSimilarity = (aMembers, bMembers) => {
    const a = new Set((aMembers || []).map((m) => m?.name).filter(Boolean));
    const b = new Set((bMembers || []).map((m) => m?.name).filter(Boolean));
    if (a.size === 0 && b.size === 0) return 1;
    if (a.size === 0 || b.size === 0) return 0;
    let intersection = 0;
    for (const name of a) {
      if (b.has(name)) intersection++;
    }
    const union = a.size + b.size - intersection;
    return union === 0 ? 0 : intersection / union;
  };

  const computeCohesion01 = (members, allianceStrength) => {
    const m = (members || []).filter(Boolean);
    const strength01 = Math.max(0, Math.min(1, (allianceStrength || 0) / 10));
    if (m.length < 2) return strength01;

    // Average pairwise relationship (rough cohesion), normalized to [0,1].
    let sum = 0;
    let pairs = 0;
    for (let i = 0; i < m.length; i++) {
      for (let j = i + 1; j < m.length; j++) {
        const a = m[i];
        const b = m[j];
        const ab = (a?.relationships?.[b?.name] ?? 0);
        const ba = (b?.relationships?.[a?.name] ?? 0);
        sum += (ab + ba) / 2;
        pairs++;
      }
    }
    const avgRel = pairs ? sum / pairs : 0;
    const rel01 = Math.max(0, Math.min(1, (avgRel + 5) / 10));

    // Blend: keep this gentle so we don't swing behavior too hard.
    return 0.55 * strength01 + 0.45 * rel01;
  };

  const pruneLateGameAlliances = (currentAlliances) => {
    const tribeCount = (tribe || []).length;
    if (tribeCount > 7) return { kept: currentAlliances, pruned: [] };

    const inTribe = [];
    const outOfTribe = [];

    (currentAlliances || []).forEach((a) => {
      const membersInTribe = getMembersInTribe(a);
      if (membersInTribe.length >= 2) inTribe.push(a);
      else outOfTribe.push(a);
    });

    // Only kick in when alliances are starting to spam late-game.
    const tooManyThreshold = Math.max(3, tribeCount - 2);
    if (inTribe.length <= tooManyThreshold) {
      return { kept: currentAlliances, pruned: [] };
    }

    const scored = inTribe
      .map((a) => {
        const membersInTribe = getMembersInTribe(a);
        return {
          alliance: a,
          membersInTribe,
          cohesion01: computeCohesion01(membersInTribe, a?.strength),
        };
      })
      .sort((x, y) => y.cohesion01 - x.cohesion01);

    const keptInTribe = [];
    const pruned = [];

    // Always keep the top couple so we don't hard-collapse everything.
    const mustKeep = Math.min(2, scored.length);
    for (let i = 0; i < mustKeep; i++) keptInTribe.push(scored[i].alliance);

    for (let i = mustKeep; i < scored.length; i++) {
      const { alliance, membersInTribe, cohesion01 } = scored[i];

      // Don't immediately dissolve alliances formed this round.
      if (newAlliances.includes(alliance)) {
        keptInTribe.push(alliance);
        continue;
      }

      const broadness = membersInTribe.length / Math.max(1, tribeCount); // 0..1
      let maxOverlap = 0;
      for (const kept of keptInTribe) {
        const keptMembers = getMembersInTribe(kept);
        maxOverlap = Math.max(maxOverlap, jaccardSimilarity(membersInTribe, keptMembers));
      }

      // Redundant if it's mostly the same people as a stronger alliance.
      const redundancy01 = Math.max(0, Math.min(1, (maxOverlap - 0.55) / 0.45));
      const broad01 = Math.max(0, Math.min(1, (broadness - 0.6) / 0.4));

      // Soft, probabilistic: mostly targets redundant + broad alliances.
      let dissolveProb = 0.08 + 0.30 * redundancy01 + 0.18 * broad01;

      // Near-full-tribe alliances late-game are often "everyone" shells.
      if (membersInTribe.length >= tribeCount - 1) dissolveProb += 0.18;

      // Strong/cohesive alliances stick around.
      dissolveProb *= (1 - 0.75 * cohesion01);

      // Only act if it's actually looking redundant.
      const looksRedundant = maxOverlap >= 0.7 || membersInTribe.length >= tribeCount - 1;
      if (looksRedundant && Math.random() < dissolveProb) {
        pruned.push(alliance);
      } else {
        keptInTribe.push(alliance);
      }
    }

    const kept = outOfTribe.concat(keptInTribe);
    return { kept, pruned };
  };

  let tribeMembersInAlliances = alliances.some((alliance) =>
    (alliance.members || []).filter((member) => tribe.includes(member)).length >= 2
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

    // If a player is already in a lot of alliances, strongly discourage them
    // from spawning yet another micro-alliance.
    const playerAllianceCount = playerAllianceCounts[player.name] || 0;
    if (playerAllianceCount >= 2 && Math.random() < 0.85) {
      return;
    }

    let tribeMembersInNewAlliances = newAlliances.some((alliance) =>
      (alliance.members || []).filter((member) => tribe.includes(member)).length >= 2
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

      // Reduce overlapping small alliances (especially lots of 2-person ones sharing
      // a common member). We allow occasional overlap, but make it rarer.
      const membersInTribeNow = members.filter((m) => tribe.includes(m));
      const isMicroAlliance = membersInTribeNow.length <= 3;
      const pairAlliancesInTribeNow = alliancesInThisTribeNow.filter(
        (a) => getMembersInTribe(a).length === 2
      );

      if (membersInTribeNow.length === 2) {
        const other = potentialMembers[0];
        const mutual = Math.min(
          player?.relationships?.[other?.name] ?? 0,
          other?.relationships?.[player?.name] ?? 0
        );

        const eitherAlreadyInPair = pairAlliancesInTribeNow.some((a) =>
          a?.members?.includes(player) || a?.members?.includes(other)
        );

        // If either member is already in a pair-alliance on this tribe, only allow
        // a new pair-alliance when they're extremely close (and even then, rarely).
        if (eitherAlreadyInPair) {
          const allow = mutual >= 4 && Math.random() < 0.35;
          if (!allow) return;
        }

        // Weak pair alliances are a major source of spam/overlap.
        if (mutual < 2 && Math.random() < 0.8) {
          return;
        }
      }

      if (isMicroAlliance) {
        const overlappingMicro = alliancesInThisTribeNow.some((a) => {
          const inTribe = getMembersInTribe(a);
          if (inTribe.length < 2 || inTribe.length > 3) return false;
          const common = inTribe.filter((m) => membersInTribeNow.includes(m)).length;
          return common >= 1;
        });

        // Don’t completely forbid overlap, just reduce it.
        if (overlappingMicro && Math.random() < 0.55) {
          return;
        }
      }

      if (lateGameTooManySmallAlliances && members.length === 2) {
        const other = potentialMembers[0];
        const mutual = Math.min(
          player?.relationships?.[other?.name] ?? 0,
          other?.relationships?.[player?.name] ?? 0
        );

        // Very, very unlikely unless they're genuinely close.
        const chance = 0.02 + (mutual >= 3 ? 0.03 : mutual >= 2 ? 0.01 : 0);
        if (Math.random() > chance) {
          return;
        }
      }

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
          const key = tribeKey || "merge";
          const tempNum = numberedAllianceCounters[key] || 1;
          numberedAllianceCounters[key] = tempNum + 1;
          const tempName = tribeNames?.[key] || (key === "merge" ? "Merge" : key);
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
          id: `a${allianceIdCounter++}`,
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
    // Keep this behavior: if an "alliance" is literally the entire tribe,
    // it auto-dissolves (it's not a meaningful alliance structure).
    if(alliance.members.length === tribe.length && alliance.members.every(member => tribe.includes(member))){
      dissolvedAlliances.push(alliance);
      return;
    }
    seenAlliances.add(memberNames);

    alliance.strength += Math.floor(Math.random() * 3) - 1;
    alliance.strength = Math.max(1, Math.min(10, alliance.strength));

    const isInCurrentTribe = (alliance.members || []).filter(member => tribe.includes(member)).length >= 2;

    let isFullyContained = alliances.some(existingAlliance =>
      existingAlliance !== alliance &&
      alliance.members.every(member => existingAlliance.members.includes(member))
    );
    if(alliance.members.length === 2){isFullyContained = false;}

    // Late-game: be more willing to clean up redundant/weak alliances.
    const lateGamePhase = merged || lateGameTooManySmallAlliances;
  
    if (isFullyContained && isInCurrentTribe && !newAlliances.includes(alliance)) {
      // Early game: rare. Late game: common.
      const dissolveChance = lateGamePhase ? 1.0 : 0.04;
      if (Math.random() < dissolveChance) {
        dissolvedAlliances.push(alliance);
      } else {
        existingAlliances.push(alliance);
      }
    } else if ((alliance.strength || 0) <= 3 && isInCurrentTribe && !newAlliances.includes(alliance)) {
      // Early game: very rare fizzle. Late game: still uncommon but noticeable.
      const dissolveChance = lateGamePhase ? 0.12 : 0.02;
      if (Math.random() < dissolveChance) {
        dissolvedAlliances.push(alliance);
      } else {
        existingAlliances.push(alliance);
      }
    } else {
      existingAlliances.push(alliance);
    }
  });

  alliances = existingAlliances;

  // Late-game: discourage a proliferation of redundant micro-alliances.
  // This is intentionally *soft* (probabilistic) and mostly removes highly
  // overlapping / near-full-tribe alliances so voting logic isn't rewritten.
  const prunedResult = pruneLateGameAlliances(alliances);
  if (prunedResult?.pruned?.length) {
    dissolvedAlliances.push(...prunedResult.pruned);
    alliances = prunedResult.kept;
  }

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





export const simulate = (
  players,
  updateResults,
  customEvents,
  useOnlyCustom,
  tsize,
  tribes,
  advantages,
  swapNum,
  mergeNum,
  numTribesParam
) => {
  let episodes = [];
  allianceIdCounter = 1;
  const inferredTribes = Math.max(
    1,
    Object.keys(tribes || {}).filter((k) => /^tribe\d+$/.test(k)).length || 1
  );
  numTribes = Number.isFinite(numTribesParam) ? numTribesParam : inferredTribes;
  count = tsize * numTribes;
  tribeNames = tribes || makeDefaultTribeNames(numTribes);
  useOnlyCustomEvents = useOnlyCustom;
  tribeSize = tsize;
  const totalPlayers = tribeSize * numTribes;

  // First, clamp swapAt (if requested) to a valid pre-merge window and also ensure
  // the pre-swap tribes can never hit 2 members.
  if (numTribes <= 1 || !Number.isFinite(swapNum)) {
    swapAt = null;
  } else {
    const minSwapSafety = Math.min(totalPlayers - 1, tribeSize * (numTribes - 1) + 2);
    const maxSwapAt = totalPlayers - 1;
    swapAt = Math.max(minSwapSafety, Math.min(swapNum, maxSwapAt));
  }

  // Now clamp mergeAt. If swapAt exists, we can allow a later merge (lower mergeAt)
  // based on the post-swap smallest tribe size.
  const baseMinMergeAt = numTribes <= 1
    ? totalPlayers
    : Math.min(totalPlayers - 1, tribeSize * (numTribes - 1) + 2);

  const minMergeAfterSwap = (Number.isFinite(swapAt) && numTribes > 1)
    ? (swapAt - Math.floor(swapAt / numTribes) + 2)
    : null;

  const minSafeMergeAt = numTribes <= 1
    ? totalPlayers
    : Math.max(2, Math.min(baseMinMergeAt, Number.isFinite(minMergeAfterSwap) ? minMergeAfterSwap : baseMinMergeAt));

  const baseMaxMergeAt = numTribes <= 1 ? totalPlayers : Math.max(1, totalPlayers - 1);
  const maxSafeMergeAt = Number.isFinite(swapAt) ? Math.min(baseMaxMergeAt, swapAt - 1) : baseMaxMergeAt;

  const requestedMergeAt = Number.isFinite(mergeNum) ? mergeNum : maxSafeMergeAt;
  mergeAt = Math.max(minSafeMergeAt, Math.min(requestedMergeAt, maxSafeMergeAt));

  // Finally, re-clamp swapAt against the chosen mergeAt (swap must happen before merge).
  if (Number.isFinite(swapAt)) {
    const minSwapAt = Math.max(mergeAt + 1, Math.min(totalPlayers - 1, tribeSize * (numTribes - 1) + 2));
    const maxSwapAt = totalPlayers - 1;
    if (minSwapAt > maxSwapAt) {
      swapAt = null;
    } else {
      swapAt = Math.max(minSwapAt, Math.min(swapAt, maxSwapAt));
    }
  }
  swapped = false;
  // Alliance names are initialized as numbered (tribe-scoped).
  // Custom naming is handled in the simulation UI.
  numberedAlliances = true;
  customRandomAllianceNames = [];
  tribeIdols = makeTribeMap(numTribes, null);
  numberedAllianceCounters = makeTribeMap(numTribes, 1);
  Object.entries(advantages).forEach(([key, value]) => {
    if (value) {
      usableAdvantages.push(key);
    }
  });

  // Ensure we always have a stable "where they started" marker for UI.
  // If it's missing (older saves / edited casts), fall back to their current tribeId.
  (players || []).forEach((p) => {
    if (!p) return;
    if (!Number.isFinite(p.originalTribeId)) {
      p.originalTribeId = Number.isFinite(p.tribeId) ? p.tribeId : 1;
    }
  });

  populateTribes(players);

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
    let driver = null;
    let driverScore = Infinity;

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
      // Prefer a driver only when that driver's personal target is ALSO this alliance target.
      const preferredCandidates = (alliance.members || []).filter(
        (m) => m?.name && personalTargetsByActor?.[m.name] === bestTarget.name
      );
      if (preferredCandidates.length > 0) {
        driver = preferredCandidates.reduce((best, m) => {
          const bestScore = best?.relationships?.[bestTarget.name] ?? 0;
          const score = m?.relationships?.[bestTarget.name] ?? 0;
          return score < bestScore ? m : best;
        }, preferredCandidates[0]);
      }

      // Otherwise, pick a simple heuristic: member with the lowest relationship score to the target.
      if (!driver) {
        alliance.members.forEach((member) => {
          const score = member.relationships?.[bestTarget.name] ?? 0;
          if (score < driverScore) {
            driverScore = score;
            driver = member;
          }
        });
      }

      updateResults({
        type: "allianceTarget",
        alliance: alliance,
        target: { name: bestTarget.name, image: bestTarget.image },
        driver: driver ? { name: driver.name, image: driver.image } : null,
        message: `<span class="text-blue-400 font-bold">${alliance.name}</span><span class="font-normal"> alliance wants to target </span><span class="text-red-400 font-bold">${bestTarget.name}</span>.`,
      });
    }
  });
};

/**
 * Handles the pre-merge phase of the game.
 * @param {Function} updateResults - Callback to update the game status.
 */
const handlePreMergePhase = (updateResults, customEvents) => {
  const totalRemaining = tribes.reduce((sum, t) => sum + (t?.length || 0), 0);

  if (!merged && !swapped && swapAt && totalRemaining === swapAt) {
    tribeSwap(updateResults);
    swapped = true;
  }

  if (totalRemaining === mergeAt) {
    mergeTribes(updateResults);
    handlePostMergePhase(updateResults, customEvents);
  } else {
      for (let i = 0; i < tribes.length; i++) {
        const tribeKey = makeTribeKey(i);
        const tribe = tribes[i];
        const displayAlliances = getAlliancesTouchingTribe(tribe);

        const snapshotMembers = (members) =>
          [...(members || [])]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((member) => ({
              ...member,
              relationships: { ...(member.relationships || {}) },
            }));

        // Emit the tribe block early (keeps current ordering), but we'll attach
        // a post-camp snapshot to the same event object later for modals.
        const tribeEvent = {
          type: "tribe",
          title: tribeNames?.[tribeKey] || `Tribe ${i + 1}`,
          alliances: displayAlliances,
          currentTribeId: i + 1,
          swapOccurred: swapped,
          members: snapshotMembers(tribe),
        };

        updateResults(tribeEvent);

        const idolEvent = findIdol(tribe, tribeKey);
        if (idolEvent) updateResults(idolEvent);

        for (let j = 0; j < 5; j++) {
          if (Math.random() > 0.7) {
            const relationshipEvent = generateRelationshipEvent(tribe, customEvents);
            if (relationshipEvent) updateResults(relationshipEvent);
          }
        }

        const alliancesUpdate = manageAlliances(tribe, tribeKey);
        if (alliancesUpdate?.newAlliances?.length) {
          updateResults({
            type: "alliance",
            title: `New Alliances Formed (${tribeNames?.[tribeKey] || `Tribe ${i + 1}`})`,
            alliances: alliancesUpdate.newAlliances,
          });
        }
        if (alliancesUpdate?.dissolvedAlliances?.length) {
          updateResults({
            type: "alliance",
            title: `Alliances Dissolved (${tribeNames?.[tribeKey] || `Tribe ${i + 1}`})`,
            alliances: alliancesUpdate.dissolvedAlliances,
          });
        }

        // Attach "after" snapshots so modals can show post-camp state.
        tribeEvent.membersAfter = snapshotMembers(tribe);
        tribeEvent.alliancesAfter = getAlliancesTouchingTribe(tribe);
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

      const immunityResult = tribalImmunity(tribes);
      const loserIndex = immunityResult?.loserIndex ?? 0;
      const winnerIndices = (immunityResult?.winnerIndices?.length
        ? immunityResult.winnerIndices
        : tribes.map((_, i) => i).filter((i) => i !== loserIndex)
      );

      loser = loserIndex;
      winner = winnerIndices[0] ?? 0;

      const loserKey = makeTribeKey(loser);
      const winnerNames = winnerIndices
        .map((idx) => {
          const key = makeTribeKey(idx);
          return tribeNames?.[key] || `Tribe ${idx + 1}`;
        })
        .join(", ");

      winnerIndices.forEach((idx) => {
        (tribes[idx] || []).forEach((player) => player.teamWins++);
      });

      const message = tribes.length <= 1
        ? `With one tribe, there is no tribe immunity challenge — everyone heads to tribal council.`
        : `${winnerNames} win${winnerIndices.length === 1 ? "s" : ""} immunity! So, ${tribeNames?.[loserKey] || `Tribe ${loser + 1}`} will be going to tribal council`;

      updateResults({
        type: "immunity",
        message,
        members: [...(tribes[loser] || [])],
      });

      updateResults({
        type: "idols",
        idols: snapshotIdols(tribeIdols),
      });
      
      detectDrasticRelationships(tribes[loser], updateResults);
      getAllianceTargets(tribes[loser], getAlliancesForTribe(tribes[loser]), updateResults);

      state = "tribal";
      const { voteIndex: out, sortedVotes: sortedVotes, voteDetails, voteSummary, idols } = voting(
        tribes[loser],
        getAlliancesForTribe(tribes[loser]),
        false,
        -1,
        usableAdvantages,
        tribeIdols
      );
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
    const snapshotMembers = (members) =>
      [...(members || [])]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((member) => ({
          ...member,
          relationships: { ...(member.relationships || {}) },
        }));

    const mergeTribeEvent = {
      type: "tribe",
      title: tribeNames.merge,
      alliances: alliances,
      members: snapshotMembers(tribes[0]),
    };

    updateResults(mergeTribeEvent);
    if (tribes[0].length === 3) {
      updateResults(
        { type: "tribe", title: "Jury", members: [...tribes[1]] }
      );
    }

    if (tribe.length > 3) {
      const idolEvent1 = findIdol(tribes[0], "merge", true);
      if (idolEvent1) updateResults(idolEvent1);
        for(let i = 0; i < 5; i++){
          let willEventOccur = Math.random();
          if(willEventOccur > 0.5){
            const relationshipEvent1 = generateRelationshipEvent(tribes[0], customEvents);
            if (relationshipEvent1) updateResults(relationshipEvent1);
          }
        }
        const alliances1 = manageAlliances(tribes[0], "merge");

        if (alliances1.newAlliances != null) {
          if (alliances1.newAlliances.length > 0) {
            updateResults({
              type: "alliance",
              title: `New Alliances Formed (${tribeNames?.merge || "Merge"})`,
              alliances: alliances1.newAlliances,
            });
          }
        }
    
        if (alliances1.dissolvedAlliances != null) {
          if (alliances1.dissolvedAlliances.length > 0) {
            updateResults({
              type: "alliance",
              title: `Alliances Dissolved (${tribeNames?.merge || "Merge"})`,
              alliances: alliances1.dissolvedAlliances,
            });
          }
        }

        // Attach "after" snapshots so the merged tribe modals reflect post-camp state.
        mergeTribeEvent.membersAfter = snapshotMembers(tribes[0]);
        mergeTribeEvent.alliancesAfter = getAlliancesTouchingTribe(tribes[0]);
    
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
          idols: snapshotIdols(tribeIdols),
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
  const mergedPlayers = tribes.flat();
  tribes = [mergedPlayers, []];
  updateResults({ type: "event", message: "Tribes are merged!"});
  state = "immunity";
};