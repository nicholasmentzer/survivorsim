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
  const [customEvents, setCustomEvents] = useState([]);
  const [eventDescription, setEventDescription] = useState("");
  const [eventType, setEventType] = useState("positive");
  const [eventSeverity, setEventSeverity] = useState(1);

  const addCustomEvent = (e) => {
    e.preventDefault();

    const player1Exists = eventDescription.includes("{Player1}");
    const player2Exists = eventDescription.includes("{Player2}");
    const numPlayers = (player1Exists ? 1 : 0) + (player2Exists ? 1 : 0);

    const newEvent = {
      description: eventDescription,
      type: numPlayers === 2 ? eventType : "neutral",
      severity: numPlayers === 2 ? eventType === "neutral" ? 0 : parseInt(eventSeverity) : 0,
      numPlayers: numPlayers
    };
    setCustomEvents([...customEvents, newEvent]);
    setEventDescription("");
  };

  const removeCustomEvent = (index) => {
    setCustomEvents((prevEvents) => prevEvents.filter((_, i) => i !== index));
  };  

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
    simulate([...playerConfig.men, ...playerConfig.women], setEpisodes, customEvents);
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
        <title>Survivor Chains - A Survivor Simulator</title>
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
          <h1 className="text-2xl font-bold text-white text-center">Survivor Chains - A Survivor Simulator</h1>
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
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <button
                    onClick={prevEpisode}
                    className={`px-4 py-2 rounded ${currentEpisode === 0 ? "bg-gray-600" : "bg-blue-500"}`}
                  >
                    Previous
                  </button>

                  <button
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold"
                    onClick={() => setMode("configure")}
                  >
                    BACK TO CONFIGURE
                  </button>

                  <button
                    onClick={nextEpisode}
                    className={`px-4 py-2 rounded ${currentEpisode === episodes.length - 1 ? "bg-gray-600" : "bg-green-500"}`}
                  >
                    Next
                  </button>
                </div>
                <h2 className="text-2xl font-bold mt-4">Episode {currentEpisode + 1}</h2>
                <div className="mt-8 space-y-8">
                  {episodes[currentEpisode]?.map((event, index) => {
                    if (event.type === "tribe") {
                      return (
                        <div key={index} className="mt-4 pb-6">
                          <h3 className="text-xl font-bold text-white">{event.title}</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-4 mt-2">
                            {event.members?.map((player) => (
                              <div
                                key={player.name}
                                className="border border-gray-500 pb-2 pt-4 pl-2 pr-2 text-center rounded bg-gray-800 text-white"
                              >
                                <img
                                  src={player.image}
                                  alt={player.name}
                                  className="w-16 h-16 object-cover rounded-full mx-auto mb-2"
                                />
                                {player.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          {event.images ? (
                            <div className="flex space-x-4">
                              {event.images.map((image, i) => (
                                <img key={i} src={image} alt="Event image" className="w-24 h-24 object-cover rounded-full mb-2" />
                              ))}
                            </div>
                          ) : null}
                
                          <div
                            className={`bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md text-center ${event.type === "voting" ? "text-sm" : "text-base font-semibold"} ${
                              event.images ? "" : "py-4 px-8"
                            }`}
                          >
                            {
                              event.type === "voting" ?
                                (event.message.map((element, index) => (
                                  <div key={index}>
                                    {element}
                                    <div className="h-2"/>
                                  </div>
                                )))
                              : event.type === "event" && event.numPlayers === 2 ?
                                (event.message.map((element, index) => (
                                  <>
                                    <div dangerouslySetInnerHTML={{ __html: element }} />
                                    <div className="h-2"/>
                                  </>
                                )))
                              : (event.message)
                            }
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </article>
        {mode === "configure" && (
            <div id="configureDiv" className="mt-12 mx-auto max-w-5xl">
              <h2 className="text-xl font-bold mb-5">Configure your cast</h2>
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
              <div className="h-5" />
              {/*<h2 className="text-xl font-bold mt-8">Configure your season.</h2>
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
              </p>*/}

              <h2 className="text-xl font-bold mt-8">Add Custom Events</h2>
              <form onSubmit={addCustomEvent} className="bg-gray-800 p-4 rounded-lg">
                <label className="text-gray-300 text-sm">Description</label>
                <input
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Example: {Player1} and {Player2} got into a huge argument. (max 2 players)"
                  className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-400"
                />
                
                <div className="h-2"/>
                <label className="text-gray-300 text-sm">Relationship Impact (only used if event has 2 players)</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
                {eventType !== "neutral" && (
                  <>
                    <div className="h-2"/>
                    <label className="text-gray-300 text-sm">Impact Severity (only used if event has 2 players)</label>
                    <input
                      type="number"
                      value={eventSeverity}
                      onChange={(e) => setEventSeverity(Number(e.target.value))}
                      min="1"
                      max="5"
                      className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-400"
                    />
                  </>
                )}
                <div className="h-2"/>
                <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">Add Event</button>
              </form>

              <h3 className="text-lg font-bold mt-4">Custom Events</h3>
              {customEvents.length === 0 ? (
                <p className="text-gray-400">No custom events added yet.</p>
              ) : (
                <ul className="text-white space-y-1">
                  <div className="mt-4 space-y-2">
                    {customEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md">
                        <span>
                          {event.description} - <span className={event.type === "positive" ? "text-green-400" : "text-red-400"}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span> ({event.severity})
                        </span>
                        <button
                          className="ml-4 bg-white px-2 py-1 rounded-full text-sm hover:bg-red-300"
                          onClick={() => removeCustomEvent(index)}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                </ul>
              )}
              <div className="h-10" />
            </div>
          )}
      </div>
    </>
  );
}
