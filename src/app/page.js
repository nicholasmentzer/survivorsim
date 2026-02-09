"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";

import { simulate, resetSimulation } from "./utils/simulation";
import playersData from "./data/players.json";
import careersData from "./data/careers.json";
import regionsData from "./data/regions.json";
import tribesData from "./data/tribes.json";
import Footer from "./components/Footer";

import WelcomeModal from "./components/WelcomeModal";
import SummaryView from "./components/SummaryView";
import EpisodeView from "./components/EpisodeView";
import ConfigureCast from "./components/ConfigureCast";
import EpisodeControls from "./components/EpisodeControls";
import CastOverview from "./components/CastOverview";
import { Button } from "@/components/ui/button";

const DEFAULT_MAX_TRIBES = 3;

const getDefaultTribeSize = (n) => {
  if (n === 1) return 18;
  if (n === 2) return 10;
  return 8; // 3 tribes (Season 50 default)
};

const DEFAULT_S50_TRIBES = {
  tribe1: [
    "Colby Donaldson",
    "Stephenie Lagrossa Kendrick",
    "Aubry Bracco",
    "Angelina Keeley",
    "Q Burdette",
    "Genevieve Mushaluk",
    "Kyle Fraser",
    "Rizo Velovic",
  ],
  tribe2: [
    "Cirie Fields",
    "Ozzy Lusth",
    "Jenna Lewis Daugherty",
    "Rick Devens",
    "Christian Hubicki",
    "Emily Flippen",
    "Joe Hunter",
    "Savannah Louie",
  ],
  tribe3: [
    "Jonathan Young",
    "Charlie Davis",
    "Tiffany Nicole Ervin",
    "Mike White",
    "Chrissy Hofbeck",
    "Kamilla Karthigesu",
    "Coach Wade",
    "Dee Valladares",
  ],
};

const buildDefaultSeason50Cast = (pool) => {
  const byName = new Map((pool || []).map((p) => [p?.name, p]));
  const out = [];
  let idx = 0;
  for (const tribeId of [1, 2, 3]) {
    const key = `tribe${tribeId}`;
    const names = DEFAULT_S50_TRIBES[key] || [];
    for (const name of names) {
      const base = byName.get(name);
      if (!base) return null;
      out.push({
        ...base,
        id: `default-s50-${tribeId}-${idx}-${base.name}`,
        tribeId,
        originalTribeId: tribeId,
      });
      idx++;
    }
  }

  // Ensure uniqueness + expected size.
  if (out.length !== 24) return null;
  const seen = new Set();
  for (const p of out) {
    if (!p?.name || seen.has(p.name)) return null;
    seen.add(p.name);
  }
  return out;
};

const getDefaultMergeAt = (totalPlayers, n) => {
  if (n <= 1) return totalPlayers; // effectively "merged" from the start
  // Safety: ensure merge can't be so late that one tribe could hit 2 players.
  // Worst-case: one tribe loses every round until merge.
  // After k eliminations, totalRemaining = totalPlayers - k.
  // Merge happens at totalRemaining = mergeAt => k = totalPlayers - mergeAt.
  // That tribe would have size = tribeSize - k. Require >= 3.
  // => mergeAt >= totalPlayers - (tribeSize - 3) = tribeSize*(n-1) + 3.
  // We can’t compute tribeSize from totalPlayers alone safely, so this is only a default.
  return Math.max(n * 2 + 1, Math.round(totalPlayers * 0.6));
};

const getMinSafeMergeAt = (tribeSize, n, totalPlayers) => {
  if (n <= 1) return totalPlayers;
  // Safety (worst-case: one tribe loses every round until merge):
  // Require no tribe can reach 1 member pre-merge => min tribe size is 2.
  // mergeAt >= tribeSize*(n-1) + 2
  return Math.min(totalPlayers - 1, tribeSize * (n - 1) + 2);
};

const getMinSafeMergeAtAfterSwap = (swapAt, n) => {
  if (!Number.isFinite(swapAt) || n <= 1) return null;
  const minTribeAfterSwap = Math.floor(swapAt / n);
  // After swap, if one tribe loses every time until merge, require it stays >=2.
  // k = swapAt - mergeAt <= minTribeAfterSwap - 2
  // => mergeAt >= swapAt - (minTribeAfterSwap - 2)
  return swapAt - minTribeAfterSwap + 2;
};

const getMergeBounds = (tribeSize, n, swapEnabled, swapAt) => {
  const totalPlayers = tribeSize * n;
  if (n <= 1) return { min: totalPlayers, max: totalPlayers };

  const baseMin = getMinSafeMergeAt(tribeSize, n, totalPlayers);
  const swapMin = swapEnabled
    ? getMinSafeMergeAtAfterSwap(swapAt, n)
    : null;
  const min = Math.max(2, Math.min(baseMin, Number.isFinite(swapMin) ? swapMin : baseMin));

  const baseMax = Math.max(1, totalPlayers - 1);
  const max = swapEnabled && Number.isFinite(swapAt)
    ? Math.min(baseMax, swapAt - 1)
    : baseMax;

  return {
    min,
    max,
  };
};

const getSwapBounds = (tribeSize, n, mergeAt) => {
  const totalPlayers = tribeSize * n;
  if (n <= 1) return { min: null, max: null };
  const max = Math.max(mergeAt + 1, totalPlayers - 1);
  const min = Math.min(totalPlayers - 1, mergeAt + 1);
  return { min, max };
};

const getDefaultSwapAt = (tribeSize, n, mergeAt) => {
  if (n <= 1) return null;
  const totalPlayers = tribeSize * n;
  // Default: about 20% of the game in, but always before merge.
  const proposed = totalPlayers - Math.max(2, Math.floor(totalPlayers * 0.2));
  return Math.max(mergeAt + 1, Math.min(proposed, totalPlayers - 1));
};

const makeDefaultTribeNames = (numTribes) => {
  const names = { merge: "Merge Tribe" };
  for (let i = 1; i <= numTribes; i++) {
    names[`tribe${i}`] = `Tribe ${i}`;
  }
  return names;
};

const getRandomPlayersFromPool = (players, num) => {
  const filteredPlayers = (players || []).filter((player) =>
    ["Survivor"].includes(player.show)
  );
  const shuffled = [...filteredPlayers].sort(() => 0.5 - Math.random());
  const picked = shuffled.slice(0, Math.min(num, shuffled.length));
  while (picked.length < num && filteredPlayers.length > 0) {
    picked.push(filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)]);
  }
  return picked;
};

export let finalPlacements = [];

export default function Home() {
  const [status, setStatus] = useState("Configure your cast.");
  const [mode, setMode] = useState("configure");
  const [numTribes, setNumTribes] = useState(3);
  const [players, setPlayers] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [eventDescription, setEventDescription] = useState("");
  const [eventType, setEventType] = useState("positive");
  const [eventSeverity, setEventSeverity] = useState(1);
  const [hideSliders, setHideSliders] = useState(false);
  const [showCurrentAlliances, setShowCurrentAlliances] = useState(false);
  const [showCurrentAdvantages, setShowCurrentAdvantages] = useState(false);
  const [tribeNames, setTribeNames] = useState(() => makeDefaultTribeNames(3));
  const [advantages, setAdvantages] = useState({
    immunityIdol: true,
  });
  const [showAdvantages, setShowAdvantages] = useState(false);
  const [tribeSize, setTribeSize] = useState(8);
  const [mergeTime, setMergeTime] = useState(14);
  const [swapEnabled, setSwapEnabled] = useState(true);
  const [swapTime, setSwapTime] = useState(18);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [showRelationshipsModal, setShowRelationshipsModal] = useState(false);
  const [alliancesModalOpen, setAlliancesModalOpen] = useState(false);
  const [currentAlliances, setCurrentAlliances] = useState([]);
  const [alliancesModalContext, setAlliancesModalContext] = useState(null);

  // Alliance naming is now handled during the simulation UI (not during setup).
  // Keyed by sorted member names (stable across the precomputed episode list).
  const [allianceNameOverrides, setAllianceNameOverrides] = useState({});

  const [playerFilters, setPlayerFilters] = useState(() =>
    selectedTribe
      ? Object.fromEntries(selectedTribe.map((player) => [player.name, "extreme"]))
      : {}
  );

  const toggleFilterMode = (playerName) => {
    setPlayerFilters((prevFilters) => ({
      ...prevFilters,
      [playerName]:
        prevFilters[playerName] === "all"
          ? "none"
          : prevFilters[playerName] === "none"
          ? "extreme"
          : "all",
    }));
  };

  const openRelationshipsModal = (tribe) => {
    setSelectedTribe(tribe);
    setShowRelationshipsModal(true);
  };

  const openAlliancesModal = (alliances, tribeMembers = null, context = null) => {
    setCurrentAlliances(alliances);
    setAlliancesModalContext({
      tribeMemberNames: (tribeMembers || []).map((m) => m?.name).filter(Boolean),
      swapOccurred: !!context?.swapOccurred,
      currentTribeId: Number.isFinite(context?.currentTribeId) ? context.currentTribeId : null,
    });
    setAlliancesModalOpen(true);
  };

  const closeRelationshipsModal = () => {
    setShowRelationshipsModal(false);
    setSelectedTribe(null);
  };

  const closeAlliancesModal = () => {
    setAlliancesModalOpen(false);
    setCurrentAlliances(null);
    setAlliancesModalContext(null);
  };

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcomePopup = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcome(false);
  };

  const addCustomEvent = (e) => {
    e.preventDefault();

    const player1Exists = eventDescription.includes("Player1");
    const player2Exists = eventDescription.includes("Player2");
    const numPlayers = (player1Exists ? 1 : 0) + (player2Exists ? 1 : 0);

    const newEvent = {
      description: eventDescription,
      type: numPlayers === 2 ? eventType : "neutral",
      severity:
        numPlayers === 2
          ? eventType === "neutral"
            ? 0
            : parseInt(eventSeverity)
          : 0,
      numPlayers: numPlayers,
    };
    setCustomEvents([...customEvents, newEvent]);
    setEventDescription("");
  };

  const randomizeAllStats = () => {
    setPlayers((prev) =>
      (prev || []).map((player) => ({
        ...player,
        premerge: Math.floor(Math.random() * 10) + 1,
        postmerge: Math.floor(Math.random() * 10) + 1,
        likeability: Math.floor(Math.random() * 10) + 1,
        threat: Math.floor(Math.random() * 10) + 1,
        strategicness: Math.floor(Math.random() * 10) + 1,
      }))
    );
  };

  const removeCustomEvent = (index) => {
    setCustomEvents((prevEvents) => prevEvents.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const { min, max } = getMergeBounds(tribeSize, numTribes, swapEnabled, swapTime);
    setMergeTime((prev) => Math.max(min, Math.min(prev, max)));
  }, [tribeSize, numTribes, swapEnabled, swapTime]);

  useEffect(() => {
    // Keep swap settings valid as merge/size/tribe-count changes.
    if (numTribes <= 1) {
      if (swapEnabled) setSwapEnabled(false);
      if (swapTime !== null) setSwapTime(null);
      return;
    }
    if (!swapEnabled) return;

    const totalPlayers = tribeSize * numTribes;
    const minSwap = mergeTime + 1;
    const maxSwap = totalPlayers - 1;

    // Also require swap happens early enough that no original tribe can reach 2 members.
    const minSwapBySafety = Math.min(totalPlayers - 1, tribeSize * (numTribes - 1) + 2);
    const effectiveMinSwap = Math.max(minSwap, minSwapBySafety);

    // No valid swap window if merge is already at/after total-1.
    if (effectiveMinSwap > maxSwap) {
      setSwapEnabled(false);
      setSwapTime(null);
      return;
    }

    setSwapTime((prev) => {
      const base = Number.isFinite(prev)
        ? prev
        : getDefaultSwapAt(tribeSize, numTribes, mergeTime);
      return Math.max(effectiveMinSwap, Math.min(base, maxSwap));
    });
  }, [swapEnabled, tribeSize, numTribes, mergeTime]);

  // When tribe count changes, reset tribe size + merge defaults to sensible scaled values.
  const didInitTribeDefaults = useRef(false);
  useEffect(() => {
    // On initial mount, keep the explicit initial defaults (swap on @ 18, merge @ 14).
    // Subsequent tribe-count changes should continue using the existing reset behavior.
    if (!didInitTribeDefaults.current) {
      didInitTribeDefaults.current = true;
      return;
    }

    const clampedNumTribes = Math.max(1, Math.min(DEFAULT_MAX_TRIBES, numTribes));
    if (clampedNumTribes !== numTribes) {
      setNumTribes(clampedNumTribes);
      return;
    }

    const nextTribeSize = getDefaultTribeSize(clampedNumTribes);
    setTribeSize(nextTribeSize);

    const totalPlayers = nextTribeSize * clampedNumTribes;
    const bounds = getMergeBounds(nextTribeSize, clampedNumTribes, false, null);
    const proposed = Math.max(bounds.min, getDefaultMergeAt(totalPlayers, clampedNumTribes));
    setMergeTime(Math.min(bounds.max, proposed));

    if (clampedNumTribes <= 1) {
      setSwapEnabled(false);
      setSwapTime(null);
    } else {
      // Keep swap disabled by default, but prime a sensible value.
      setSwapTime(getDefaultSwapAt(nextTribeSize, clampedNumTribes, Math.min(bounds.max, proposed)));
    }
  }, [numTribes]);

  useEffect(() => {
    const clampedNumTribes = Math.max(1, Math.min(DEFAULT_MAX_TRIBES, numTribes));
    if (clampedNumTribes !== numTribes) setNumTribes(clampedNumTribes);

    setTribeNames((prev) => {
      const next = makeDefaultTribeNames(clampedNumTribes);
      Object.keys(next).forEach((k) => {
        if (prev?.[k]) next[k] = prev[k];
      });
      if (prev?.merge) next.merge = prev.merge;
      return next;
    });

    const pool = [...playersData.men, ...playersData.women];
    const wantsDefaultS50 = clampedNumTribes === 3 && tribeSize === 8;
    if (wantsDefaultS50) {
      const defaultCast = buildDefaultSeason50Cast(pool);
      if (defaultCast) {
        setPlayers(defaultCast);
        return;
      }
    }

    const totalPlayers = tribeSize * clampedNumTribes;
    const picked = getRandomPlayersFromPool(pool, totalPlayers).map((p, idx) => {
      const tribeId = Math.floor(idx / tribeSize) + 1;
      return {
        ...p,
        id: `${Date.now()}-${idx}-${p.name}`,
        tribeId,
        originalTribeId: tribeId,
      };
    });
    setPlayers(picked);
  }, [tribeSize, numTribes]);

  const [results, setResults] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [useOnlyCustomEvents, setUseOnlyCustomEvents] = useState(false);

  const startSimulation = () => {
    resetSimulation();
    finalPlacements = [];
    setAllianceNameOverrides({});
    const allNames = (players || []).map((p) => p.name);

    const nameSet = new Set();
    const duplicates = allNames.filter((name) => {
      if (nameSet.has(name)) return true;
      nameSet.add(name);
      return false;
    });

    if (duplicates.length > 0) {
      alert(
        `Duplicate names found: ${duplicates.join(
          ", "
        )}. Please make all names unique before starting the simulation.`
      );
      return;
    }

    window.scrollTo({ top: 0 });
    setEpisodes([]);
    simulate(
      players,
      setEpisodes,
      customEvents,
      useOnlyCustomEvents,
      tribeSize,
      tribeNames,
      advantages,
      swapEnabled ? swapTime : null,
      mergeTime,
      numTribes
    );
    setMode("simulate");
    setCurrentEpisode(0);
  };

  const handleBackToConfigure = () => {
    resetSimulation();
    finalPlacements = [];
    setAllianceNameOverrides({});
    window.scrollTo({ top: 0 });
    setMode("configure");
    setTribeNames(makeDefaultTribeNames(numTribes));
  };

  const nextEpisode = () => {
    setShowCurrentAlliances(false);
    if (mode === "summary") {
      resetSimulation();
      finalPlacements = [];
      setTribeNames(makeDefaultTribeNames(numTribes));
      setMode("configure");
    } else if (currentEpisode === episodes.length - 1) {
      setMode("summary");
    } else {
      setCurrentEpisode((prev) => Math.min(prev + 1, episodes.length - 1));
    }
    window.scrollTo({ top: 0 });
  };

  const prevEpisode = () => {
    setShowCurrentAlliances(false);
    if (mode === "summary") {
      setMode("simulate");
    } else if (currentEpisode === 0) {
      resetSimulation();
      finalPlacements = [];
      setTribeNames(makeDefaultTribeNames(numTribes));
      setMode("configure");
    } else {
      setCurrentEpisode((prev) => Math.max(prev - 1, 0));
    }
    window.scrollTo({ top: 0 });
  };

  const totalPlayersExpected = tribeSize * numTribes;
  // Avoid replacing the whole page with a temporary loading view when tribe settings
  // change (it causes a visible flicker + scroll jump). Only show this on true initial
  // bootstrapping when we have no players at all.
  if (!players || players.length === 0) {
    return <p className="text-center text-white">Loading players...</p>;
  }

  return (
    <div>
      <Head>
        <title>Chains - A Survivor Simulator</title>
        <meta
          name="description"
          content="Customize the contestants, set the rules and scenarios, and experience unique Survivor simulations every time!"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Chains" />
        <meta property="og:description" content="A Survivor Simulator" />
        <meta
          property="og:image"
          content="https://thesurvivorchains.com/logo.png"
        />
        <meta property="og:url" content="https://thesurvivorchains.com/" />
        <meta property="og:type" content="website" />
        <script
          src="https://code.jquery.com/jquery-2.1.4.min.js"
          defer
        ></script>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"
          defer
        ></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="flex min-h-screen">
        <main className="w-full mx-auto flex flex-col items-center flex-grow relative">
          <WelcomeModal show={showWelcome} onClose={closeWelcomePopup} />

          <div className="relative min-h-screen flex-col items-center justify-center w-full">
            <article className="prose mx-auto w-full pt-12 p-6 rounded-lg">
              <div className="flex justify-center">
                <img
                  src="/logo.png"
                  alt="Survivor Chains Logo"
                  className="h-24 w-auto object-contain"
                />
              </div>
              <h4
                className="
                  text-sm sm:text-base
                  text-stone-300
                  tracking-[0.25em]
                  uppercase
                  text-center
                  mt-5
                "
                style={{ fontFamily: "Bebas Neue" }}
              >
                A Survivor Simulator
              </h4>
              <div id="interface" className="text-center mt-8 w-full">
                {/* TOP CONTROLS BAR */}
                <EpisodeControls
                  variant="top"
                  mode={mode}
                  startSimulation={startSimulation}
                  prevEpisode={prevEpisode}
                  nextEpisode={nextEpisode}
                  currentEpisode={currentEpisode}
                  episodesLength={episodes.length}
                  onBackToConfigure={handleBackToConfigure}
                />

                {/* MAIN CONTENT BELOW CONTROLS */}
                <div className="mt-6">
                  {mode === "summary" ? (
                    <SummaryView finalPlacements={finalPlacements} />
                  ) : mode === "simulate" ? (
                    <EpisodeView
                      episodes={episodes}
                      currentEpisode={currentEpisode}
                      prevEpisode={prevEpisode}
                      nextEpisode={nextEpisode}
                      onBackToConfigure={handleBackToConfigure}
                      showCurrentAlliances={showCurrentAlliances}
                      setShowCurrentAlliances={setShowCurrentAlliances}
                      showAdvantages={showAdvantages}
                      setShowAdvantages={setShowAdvantages}
                      showRelationshipsModal={showRelationshipsModal}
                      openRelationshipsModal={openRelationshipsModal}
                      closeRelationshipsModal={closeRelationshipsModal}
                      alliancesModalOpen={alliancesModalOpen}
                      openAlliancesModal={openAlliancesModal}
                      closeAlliancesModal={closeAlliancesModal}
                      currentAlliances={currentAlliances}
                      alliancesModalContext={alliancesModalContext}
                      allianceNameOverrides={allianceNameOverrides}
                      setAllianceNameOverrides={setAllianceNameOverrides}
                      selectedTribe={selectedTribe}
                      playerFilters={playerFilters}
                      toggleFilterMode={toggleFilterMode}
                    />
                  ) : null}
                </div>
              </div>
            </article>

            {mode === "configure" && (
              <CastOverview players={players} tribeNames={tribeNames} numTribes={numTribes} />
            )}

            {mode === "configure" && (
              <ConfigureCast
                players={players}
                setPlayers={setPlayers}
                careersData={careersData}
                regionsData={regionsData}
                tribesData={tribesData}
                hideSliders={hideSliders}
                setHideSliders={setHideSliders}
                tribeSize={tribeSize}
                setTribeSize={setTribeSize}
                numTribes={numTribes}
                setNumTribes={setNumTribes}
                mergeTime={mergeTime}
                setMergeTime={setMergeTime}
                swapEnabled={swapEnabled}
                setSwapEnabled={setSwapEnabled}
                swapTime={swapTime}
                setSwapTime={setSwapTime}
                advantages={advantages}
                setAdvantages={setAdvantages}
                tribeNames={tribeNames}
                setTribeNames={setTribeNames}
                randomizeAllStats={randomizeAllStats}
                customEvents={customEvents}
                eventDescription={eventDescription}
                setEventDescription={setEventDescription}
                eventType={eventType}
                setEventType={setEventType}
                eventSeverity={eventSeverity}
                setEventSeverity={setEventSeverity}
                addCustomEvent={addCustomEvent}
                useOnlyCustomEvents={useOnlyCustomEvents}
                setUseOnlyCustomEvents={setUseOnlyCustomEvents}
                removeCustomEvent={removeCustomEvent}
              />
            )}

            {/* BOTTOM BUTTON SETS */}
            <EpisodeControls
              mode={mode}
              startSimulation={startSimulation}
              prevEpisode={prevEpisode}
              nextEpisode={nextEpisode}
              currentEpisode={currentEpisode}
              episodesLength={episodes.length}
              onBackToConfigure={handleBackToConfigure}
            />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
