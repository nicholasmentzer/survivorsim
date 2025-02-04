"use client";
import { useState } from "react";
import Head from "next/head";
import PlayerConfig from "./components/PlayerConfig";
import { populateTribes, simulate } from "./utils/simulation";
import playersData from "./data/players.json";
import careersData from "./data/careers.json";
import regionsData from "./data/regions.json";
import tribesData from "./data/tribes.json";

export default function Home() {
  const [status, setStatus] = useState("Configure your cast.");
  const [mode, setMode] = useState("configure");
  const [tribes, setTribes] = useState([]);
  const [playerConfig, setPlayerConfig] = useState(playersData);
  const [results, setResults] = useState([]);

  const updateResults = (message) => {
    setResults((prev) => [...prev, message]);
  };

  const startSimulation = () => {
    setResults([]);
    setStatus("Simulation running...");
    simulate(
      [...playerConfig.men, ...playerConfig.women],
      updateResults,
      50 // Simulation speed
    );
    setMode("simulate");
  };

  const toggleMode = () => {
    if (mode === "configure") {
      startSimulation();
      setMode("simulate");
    } else {
      setMode("configure");
      setStatus("Configure your cast.");
    }
  };

  return (
    <>
      <Head>
        <title>Survivor Simulator</title>
        <meta name="description" content="This is a simulator for the game of Survivor." />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" defer></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js" defer></script>
      </Head>
      <div className="relative">
        <article className="prose mx-auto max-w-5xl pt-8">
          <h1 className="text-2xl font-bold">Survivor Simulator</h1>
          <div id="interface" className="text-center mt-8">
            {mode === "configure" ? (
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold"
                onClick={startSimulation}
              >
                SIMULATE
              </button>
            ) : (
              <button
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold"
                onClick={() => setMode("configure")}
              >
                BACK TO CONFIGURE
              </button>
            )}
          </div>
          {mode === "configure" && (
            <div id="configureDiv" className="mt-12">
              <h2 className="text-xl font-bold mb-5">Configure your cast.</h2>
              <PlayerConfig
                gender="men"
                players={playerConfig}
                careers={careersData}
                regions={regionsData}
                tribes={tribesData}
              />
              <div className="h-5" />
              <PlayerConfig
                gender="women"
                players={playerConfig}
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
          {mode === "simulate" && (
            <div className="mt-8">
              <h2 className="text-lg font-bold">Simulation Results</h2>
              <div className="mt-4 space-y-2">
                {results.map((result, index) => (
                  <p key={index} className="text-sm text-gray-800">
                    {result}
                  </p>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
