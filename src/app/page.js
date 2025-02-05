"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import PlayerConfig from "./components/PlayerConfig";
import { populateTribes, simulate } from "./utils/simulation";
import playersData from "./data/players.json";
import careersData from "./data/careers.json";
import regionsData from "./data/regions.json";
import tribesData from "./data/tribes.json";

const getRandomPlayers = (players, num) => {
  const shuffled = [...players].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export default function Home() {
  const [status, setStatus] = useState("Configure your cast.");
  const [mode, setMode] = useState("configure");
  const [tribes, setTribes] = useState([]);
  const [playerConfig, setPlayerConfig] = useState(null);

  useEffect(() => {
    setPlayerConfig({
      men: getRandomPlayers(playersData.men, 10),
      women: getRandomPlayers(playersData.women, 10),
    });
  }, []);

  const [results, setResults] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(0);

  const startSimulation = () => {
    setEpisodes([]);
    simulate([...playerConfig.men, ...playerConfig.women], setEpisodes, 50);
    setMode("simulate");
    setCurrentEpisode(0);
  };

  const nextEpisode = () => {
    if (currentEpisode === episodes.length - 1) {
      setMode("configure");
    } else {
      setCurrentEpisode((prev) => Math.min(prev + 1, episodes.length - 1));
    }
  };
  const prevEpisode = () => {
    if (currentEpisode === 0) {
      setMode("configure");
    } else {
      setCurrentEpisode((prev) => Math.max(prev - 1, 0));
    }
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
    <>
      <Head>
        <title>Survivor Simulator</title>
        <meta name="description" content="This is a simulator for the game of Survivor." />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" defer></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js" defer></script>
      </Head>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="relative min-h-screen flex-col items-center justify-center">
        <article className="prose mx-auto w-full max-w-[75%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[75%] pt-8 p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-white text-center">Survivor Simulator</h1>
          <div id="interface" className="text-center mt-8">
            {mode === "configure" ? (
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold"
                onClick={startSimulation}
              >
                SIMULATE
              </button>
            ) : (
              <div className="text-center p-4 text-white min-h-screen">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold"
                  onClick={() => setMode("configure")}
                >
                  BACK TO CONFIGURE
                </button>
                <h2 className="text-2xl font-bold mt-4">Episode {currentEpisode + 1}</h2>
                <div className="mt-4 space-y-2">
                  {episodes[currentEpisode]?.map((event, index) => (
                    <p key={index}>{event}</p>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={prevEpisode}
                    className={`px-4 py-2 rounded ${currentEpisode === 0 ? "bg-gray-600" : "bg-blue-500"}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextEpisode}
                    className={`px-4 py-2 rounded ${currentEpisode === episodes.length - 1 ? "bg-gray-600" : "bg-green-500"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          {mode === "simulate" && (
            <div className="mt-8">
              <h2 className="text-lg font-bold">Simulation Results</h2>
              <div className="mt-4 space-y-2">
                {results.map((result, index) => (
                  <p key={index} className="text-sm text-white">
                    {result}
                  </p>
                ))}
              </div>
            </div>
          )}
        </article>
        {mode === "configure" && (
            <div id="configureDiv" className="mt-12 mx-auto max-w-5xl">
              <h2 className="text-xl font-bold mb-5">Configure your cast.</h2>
              <PlayerConfig
                gender="men"
                players={playerConfig}
                updatePlayers={updatePlayers}
                careers={careersData}
                regions={regionsData}
                tribes={tribesData}
              />
              <div className="h-5" />
              <PlayerConfig
                gender="women"
                players={playerConfig}
                updatePlayers={updatePlayers}
                careers={careersData}
                regions={regionsData}
                tribes={tribesData}
              />
              <h2 className="text-xl font-bold mt-8">Configure your season.</h2>
              <p>
                Total cast:
                <select className="ml-2 border border-gray-300 rounded-md">
                  <option value="20">20</option>
                </select>
              </p>
              <p>
                Starting # of tribes:
                <select className="ml-2 border border-gray-300 rounded-md">
                  <option value="2">2</option>
                </select>
              </p>
            </div>
          )}
      </div>
    </>
  );
}
