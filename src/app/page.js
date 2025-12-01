"use client";
import { useState, useEffect } from "react";
import Head from "next/head";

import { populateTribes, simulate, resetSimulation } from "./utils/simulation";
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

const getRandomPlayers = (players, num) => {
  const filteredPlayers = players.filter((player) =>
    ["Survivor"].includes(player.show)
  );

  const shuffled = [...filteredPlayers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export let finalPlacements = [];

export default function Home() {
  const [status, setStatus] = useState("Configure your cast.");
  const [mode, setMode] = useState("configure");
  const [tribes, setTribes] = useState([]);
  const [playerConfig, setPlayerConfig] = useState(null);
  const [customEvents, setCustomEvents] = useState([]);
  const [customAllianceNames, setCustomAllianceNames] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [customAllianceDescription, setCustomAllianceDescription] =
    useState("");
  const [eventType, setEventType] = useState("positive");
  const [eventSeverity, setEventSeverity] = useState(1);
  const [hideSliders, setHideSliders] = useState(false);
  const [showCurrentAlliances, setShowCurrentAlliances] = useState(false);
  const [showCurrentAdvantages, setShowCurrentAdvantages] = useState(false);
  const [useNumberedAlliances, setuseNumberedAlliances] = useState(true);
  const [showDetailedVotes, setShowDetailedVotes] = useState(false);
  const [tribeNames, setTribeNames] = useState({
    tribe1: "Tribe 1",
    tribe2: "Tribe 2",
    merge: "Merge Tribe",
  });
  const [advantages, setAdvantages] = useState({
    immunityIdol: true,
  });
  const [showAdvantages, setShowAdvantages] = useState(false);
  const [tribeSize, setTribeSize] = useState(10);
  const [mergeTime, setMergeTime] = useState(12);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [showRelationshipsModal, setShowRelationshipsModal] = useState(false);
  const [alliancesModalOpen, setAlliancesModalOpen] = useState(false);
  const [currentAlliances, setCurrentAlliances] = useState([]);

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

  const openAlliancesModal = (alliances) => {
    setCurrentAlliances(alliances);
    setAlliancesModalOpen(true);
  };

  const closeRelationshipsModal = () => {
    setShowRelationshipsModal(false);
    setSelectedTribe(null);
  };

  const closeAlliancesModal = () => {
    setAlliancesModalOpen(false);
    setCurrentAlliances(null);
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

  const addCustomAllianceName = (e) => {
    e.preventDefault();
    setCustomAllianceNames([...customAllianceNames, customAllianceDescription]);
    setCustomAllianceDescription("");
  };

  const randomizeAllStats = () => {
    setPlayerConfig((prevConfig) => {
      const randomizeStats = (players) => {
        return players.map((player) => ({
          ...player,
          premerge: Math.floor(Math.random() * 10) + 1,
          postmerge: Math.floor(Math.random() * 10) + 1,
          likeability: Math.floor(Math.random() * 10) + 1,
          threat: Math.floor(Math.random() * 10) + 1,
          strategicness: Math.floor(Math.random() * 10) + 1,
        }));
      };

      return {
        men: randomizeStats(prevConfig.men),
        women: randomizeStats(prevConfig.women),
      };
    });
  };

  const removeCustomEvent = (index) => {
    setCustomEvents((prevEvents) => prevEvents.filter((_, i) => i !== index));
  };

  const removeCustomName = (index) => {
    setCustomAllianceNames((prevNames) =>
      prevNames.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    setMergeTime((prev) =>
      Math.max(tribeSize + 1, Math.min(prev, tribeSize * 2))
    );
  }, [tribeSize]);

  useEffect(() => {
    setPlayerConfig({
      men: getRandomPlayers(playersData.men, tribeSize),
      women: getRandomPlayers(playersData.women, tribeSize),
    });
  }, [tribeSize]);

  const [results, setResults] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [useOnlyCustomEvents, setUseOnlyCustomEvents] = useState(false);

  const startSimulation = () => {
    resetSimulation();
    finalPlacements = [];
    const allNames = [
      ...playerConfig.men.map((p) => p.name),
      ...playerConfig.women.map((p) => p.name),
    ];

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
      [...playerConfig.men, ...playerConfig.women],
      setEpisodes,
      customEvents,
      useOnlyCustomEvents,
      tribeSize,
      tribeNames,
      advantages,
      customAllianceNames,
      mergeTime,
      useNumberedAlliances
    );
    setMode("simulate");
    setCurrentEpisode(0);
  };

  const handleBackToConfigure = () => {
    resetSimulation();
    setuseNumberedAlliances(true);
    finalPlacements = [];
    window.scrollTo({ top: 0 });
    setMode("configure");
    setTribeNames({ tribe1: "Tribe 1", tribe2: "Tribe 2", merge: "Merge Tribe" });
  };

  const nextEpisode = () => {
    setShowCurrentAlliances(false);
    setShowDetailedVotes(false);
    if (mode === "summary") {
      resetSimulation();
      finalPlacements = [];
      setuseNumberedAlliances(true);
      setTribeNames({
        tribe1: "Tribe 1",
        tribe2: "Tribe 2",
        merge: "Merge Tribe",
      });
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
    setShowDetailedVotes(false);
    if (mode === "summary") {
      setMode("simulate");
    } else if (currentEpisode === 0) {
      resetSimulation();
      setuseNumberedAlliances(true);
      finalPlacements = [];
      setTribeNames({
        tribe1: "Tribe 1",
        tribe2: "Tribe 2",
        merge: "Merge Tribe",
      });
      setMode("configure");
    } else {
      setCurrentEpisode((prev) => Math.max(prev - 1, 0));
    }
    window.scrollTo({ top: 0 });
  };

  const updatePlayers = (gender, updatedPlayers) => {
    setPlayerConfig((prevConfig) => ({
      ...prevConfig,
      [gender]: updatedPlayers,
    }));
  };

  if (!playerConfig) {
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
                      selectedTribe={selectedTribe}
                      playerFilters={playerFilters}
                      toggleFilterMode={toggleFilterMode}
                    />
                  ) : null}
                </div>
              </div>
            </article>

            {mode === "configure" && (
              <CastOverview playerConfig={playerConfig} tribeNames={tribeNames} />
            )}

            {mode === "configure" && (
              <ConfigureCast
                playerConfig={playerConfig}
                updatePlayers={updatePlayers}
                careersData={careersData}
                regionsData={regionsData}
                tribesData={tribesData}
                hideSliders={hideSliders}
                setHideSliders={setHideSliders}
                tribeSize={tribeSize}
                setTribeSize={setTribeSize}
                mergeTime={mergeTime}
                setMergeTime={setMergeTime}
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
                customAllianceDescription={customAllianceDescription}
                setCustomAllianceDescription={setCustomAllianceDescription}
                addCustomAllianceName={addCustomAllianceName}
                customAllianceNames={customAllianceNames}
                removeCustomName={removeCustomName}
                useNumberedAlliances={useNumberedAlliances}
                setuseNumberedAlliances={setuseNumberedAlliances}
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
