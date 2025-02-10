"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import PlayerConfig from "./components/PlayerConfig";
import { populateTribes, simulate, resetSimulation } from "./utils/simulation";
import playersData from "./data/players.json";
import careersData from "./data/careers.json";
import regionsData from "./data/regions.json";
import tribesData from "./data/tribes.json";
import Footer from "./components/Footer";

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
  const [customAllianceNames, setCustomAllianceNames] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [customAllianceDescription, setCustomAllianceDescription] = useState("");
  const [eventType, setEventType] = useState("positive");
  const [eventSeverity, setEventSeverity] = useState(1);
  const [hideSliders, setHideSliders] = useState(false);
  const [showCurrentAlliances, setShowCurrentAlliances] = useState(false);
  const [showDetailedVotes, setShowDetailedVotes] = useState(false);
  const [tribeNames, setTribeNames] = useState({ tribe1: "Tribe 1", tribe2: "Tribe 2", merge: "Merge Tribe" });
  const [advantages, setAdvantages] = useState({
    immunityIdol: true,
  });
  const [showAdvantages, setShowAdvantages] = useState(false);
  const [tribeSize, setTribeSize] = useState(10);
  const [showWelcome, setShowWelcome] = useState(false);

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
      severity: numPlayers === 2 ? eventType === "neutral" ? 0 : parseInt(eventSeverity) : 0,
      numPlayers: numPlayers
    };
    setCustomEvents([...customEvents, newEvent]);
    setEventDescription("");
  };

  const addCustomAllianceName = (e) => {
    e.preventDefault();
    setCustomAllianceNames([...customAllianceNames, customAllianceDescription]);
    setCustomAllianceDescription("");
  };

  const removeCustomEvent = (index) => {
    setCustomEvents((prevEvents) => prevEvents.filter((_, i) => i !== index));
  };  

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
    window.scrollTo({ top: 0 });
    setEpisodes([]);
    simulate([...playerConfig.men, ...playerConfig.women], setEpisodes, customEvents, useOnlyCustomEvents, tribeSize, tribeNames, advantages, customAllianceNames);
    setMode("simulate");
    setCurrentEpisode(0);
  };

  const nextEpisode = () => {
    setShowCurrentAlliances(false);
    setShowDetailedVotes(false);
    if (currentEpisode === episodes.length - 1) {
      resetSimulation();
      setMode("configure");
    } else {
      setCurrentEpisode((prev) => Math.min(prev + 1, episodes.length - 1));
    }
    window.scrollTo({ top: 0 });

  };
  const prevEpisode = () => {
    setShowCurrentAlliances(false);
    setShowDetailedVotes(false);
    if (currentEpisode === 0) {
      resetSimulation();
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
        <meta name="description" content="Customize the contestants, set the rules and scenarios, and experience unique Survivor simulations every time!"/>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Chains" />
        <meta property="og:description" content="A Survivor Simulator" />
        <meta property="og:image" content="https://thesurvivorchains.com/logo.png" />
        <meta property="og:url" content="https://thesurvivorchains.com/" />
        <meta property="og:type" content="website" />
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" defer></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js" defer></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </Head>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="flex min-h-screen">

      <main className="w-[100%] mx-auto flex flex-col items-center flex-grow relative">
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-stone-900 text-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-3">Welcome to Chains - A Survivor Simulator!</h2>
            <p className="text-sm text-left">
              Customize your players, configure settings, and simulate unique Survivor seasons! <br/><br/>
            </p>
            <p className="text-base text-left font-bold">
              Reminder: To edit player images and names, just click on the picture or names, and use sliders to adjust stats!! <br/><br/>
            </p>
            <p className="text-base mb-4 text-left text-red-200">
              (If you want to add custom events to your simulation, scroll to the bottom of this page!)
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={closeWelcomePopup}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
      <div className="relative min-h-screen flex-col items-center justify-center">
        <article className="prose mx-auto w-full max-w-[75%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[75%] pt-12 p-6 rounded-lg">
          <div className="flex justify-center">
            <img 
              src="/logo.png"
              alt="Survivor Chains Logo"
              className="h-40 w-auto object-contain"
            />
          </div>
          <h4 className="text-2xl font-bold text-slate-300 text-center mt-4" style={{ fontFamily: "Bebas Neue" }}> A Survivor Simulator</h4>

          <div id="interface" className="text-center mt-8">

            {/*TOP BUTTON SETS*/}
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
                    className={`px-4 py-2 rounded ${currentEpisode === 0 ? "bg-stone-600" : "bg-blue-500"}`}
                  >
                    Previous
                  </button>

                  <button
                    className="bg-stone-500 text-white px-6 py-3 rounded-lg font-bold"
                    onClick={() => {resetSimulation();window.scrollTo({ top: 0 });setMode("configure");}}
                  >
                    BACK TO CONFIGURE
                  </button>

                  <button
                    onClick={nextEpisode}
                    className={`px-4 py-2 rounded ${currentEpisode === episodes.length - 1 ? "bg-stone-600" : "bg-green-500"}`}
                  >
                    Next
                  </button>
                </div>


                <h2 className="text-2xl font-bold mt-4">Episode {currentEpisode + 1}</h2>
                <div className="mt-8 space-y-8">
                  {episodes[currentEpisode]?.map((event, index) => {
                    if (event.type === "tribe") {
                      return (
                        <div key={index}>
                          <span className="text-xl font-bold uppercase tracking-wide">{event.title} Events</span>
                          <div className="mb-2 border-t-4 border-gray-400"></div>
                          <div className="mt-4 pb-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-4 mt-2">
                              {event.members?.map((player) => (
                                <div
                                  key={player.name}
                                  className="text-xs sm:text-base border border-gray-500 pb-2 pt-4 pl-2 pr-2 text-center rounded bg-stone-800 text-white break-words"
                                >
                                  <img
                                    src={player.image}
                                    alt={player.name}
                                    className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full mx-auto mb-2"
                                    style={{ imageRendering: "high-quality" }} 
                                  />
                                  {player.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    } else if(event.type === "alliance"){
                      return (
                        <div key={index} className="mt-4 pb-6">
                          {event.title === "Current Alliances" && (<div className="mb-6 border-t-4 border-gray-400"></div>)}
                          <div className="flex items-center justify-center">
                            <h3 className="text-xl font-bold text-blue-400">{event.title}</h3>

                            {/* Dropdown Icon Toggle (Only for Current Alliances) */}
                            {event.title === "Current Alliances" && (
                              <button
                                onClick={() => setShowCurrentAlliances((prev) => !prev)}
                                className="p-2 rounded-lg hover:bg-stone-700 transition"
                              >
                                {showCurrentAlliances ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>

                          {event.title === "Current Alliances" ? 
                            <div className={`${showCurrentAlliances ? "block" : "hidden"}`}>
                              {event.alliances.map((alliance, i) => (
                                <div key={i} className="mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
                                  <h4 className="text-lg font-bold text-white">{alliance.name}</h4>
                                  <div className="text-white">{`Strength: ${alliance.strength}`}</div>
                                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                                    {alliance.members.map((member) => (
                                      <div key={member.name} className="text-center">
                                        <img 
                                          src={member.image} 
                                          className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 mx-auto" 
                                          style={{ imageRendering: "high-quality" }} 
                                        />
                                        <p className="text-white text-xs sm:text-sm mt-1">{member.name}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            : event.alliances.map((alliance, i) => (
                              <div key={i} className="mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
                                <h4 className="text-lg font-bold text-white">{alliance.name}</h4>
                                <div className="text-white">{`Strength: ${alliance.strength}`}</div>
                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                  {alliance.members.map((member) => (
                                    <div key={member.name} className="text-center">
                                      <img 
                                        src={member.image} 
                                        className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 mx-auto" 
                                        style={{ imageRendering: "high-quality" }} 
                                      />
                                      <p className="text-white text-xs sm:text-sm mt-1">{member.name}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      );
                    } else if (event.type === "idols") {
                      return (
                        <div key={index} className="pb-6">
                          <div className="flex items-center justify-center">
                            <h3 className="text-xl font-bold text-blue-400">Current Advantages</h3>

                            {/* Dropdown Icon Toggle (Idols) */}
                            {event.type === "idols" && (
                              <button
                                onClick={() => setShowAdvantages((prev) => !prev)}
                                className="p-2 rounded-lg hover:bg-stone-700 transition"
                              >
                                {showAdvantages ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          
                          {showAdvantages && event.idols && (
                            <div className="bg-stone-800 bg-opacity-40 rounded-lg shadow-lg p-4 mt-3">
                              <div className="space-y-2">
                                {Object.entries(event.idols).map(([tribe, player]) => (
                                  player ? (
                                    <div key={tribe} className="text-white p-2">
                                      <span className="font-bold">{player.name}</span> has an idol!
                                    </div>
                                  ) : (
                                    <div key={tribe} className="text-gray-400 p-2">
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                            
                        </div>
                      );
                    } else if (event.type === "allianceTarget") {
                      return( <div key={index} className="mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                          {event.alliance.members.map((member) => (
                            <div key={member.name} className="text-center">
                              <img 
                                src={member.image} 
                                className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 mx-auto" 
                                style={{ imageRendering: "high-quality" }} 
                              />
                              <p className="text-white text-xs sm:text-sm mt-1">{member.name}</p>
                            </div>
                          ))}
                        </div>
                        <div
                          className={` text-white px-6 pt-6 rounded-lg text-center text-xs sm:text-base font-semibold ${
                            event.images ? "" : "py-4 px-8"
                          }`}
                        > <div dangerouslySetInnerHTML={{ __html: event.message }} />
                        </div>
                      </div> );
                    } else if (event.type === "immunity") {
                      return (
                        <div key={index}>
                          <span className="text-xl font-bold uppercase tracking-wide">Immunity Challenge</span>
                          <div className="mb-2 border-t-4 border-gray-400"></div>
                          <div className="mt-4 pb-6">
                            <div
                                className={`bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-base font-semibold ${
                                  event.images ? "" : "py-4 px-8"
                                }`}
                              > <div dangerouslySetInnerHTML={{ __html: event.message }} />
                              </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-4 mt-2">
                              {event.members?.map((player) => (
                                <div
                                  key={player.name}
                                  className="text-xs sm:text-base border border-gray-500 pb-2 pt-4 pl-2 pr-2 text-center rounded bg-stone-800 text-white break-words"
                                >
                                  <img
                                    src={player.image}
                                    alt={player.name}
                                    className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-full mx-auto mb-2"
                                    style={{ imageRendering: "high-quality" }} 
                                  />
                                  {player.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index}>
                          {event.type === "voting-summary" ? 
                            <div className="mt-10">
                              <span className="text-xl font-bold uppercase tracking-wide">Tribal Council</span>
                              <div className="mb-6 border-t-4 border-gray-400"></div>
                            </div>
                            : <></>
                          }
                          {event.type === "relationship" ? 
                            <div className="mt-10">
                              <span className="text-xl font-bold uppercase tracking-wide">Relationship Highlights/Targets</span>
                              <div className="mb-6 border-t-4 border-gray-400"></div>
                            </div>
                            : <></>
                          }
                          { event.type !== "relationship" ?
                          <div className="flex flex-col items-center space-y-2">
                            {event.images ? (
                              <div className="flex space-x-4">
                                {event.images.map((image, i) => (
                                  <img key={i} src={image} alt="Event image" className="w-12 h-12 sm:w-24 sm:h-24 object-cover rounded-full mb-2" style={{ imageRendering: "high-quality" }}  />
                                ))}
                              </div>
                            ) : null}

                            {event.type === "voting-summary" ?
                              <div className="bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-sm w-1/2">
                                {event.message.map((vote, i) => (
                                  <div key={i} className="text-xs sm:text-sm font-semibold py-4" dangerouslySetInnerHTML={{ __html: vote }}></div>
                                ))}
                              </div>
                            : event.type === "voting" ?
                              <div className="bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center w-1/2">
                                {event.message.map((vote, i) => {
                                  if(!vote.includes("voted for")){ return(<div key={i} className="text-xs sm:text-sm mb-1" dangerouslySetInnerHTML={{ __html: vote }}></div>); } else { 
                                    let action = "voted for";
                                    if (vote.includes("revoted for")) {
                                      action = "revoted for";
                                    }

                                    const voteParts = vote.split(` ${action} `);
                                    const voter = voteParts[0];
                                    let target = voteParts[1] || "";

                                    let allianceText = "";
                                    if (target.includes(" with ")) {
                                      const targetParts = target.split(" with ");
                                      target = targetParts[0];
                                      allianceText = ` with ${targetParts[1]}`;
                                    }

                                    return (
                                      <div key={i} className="grid grid-cols-3 gap-2 px-4 py-1">
                                        <span className="text-sm font-semibold text-blue-300 text-left">{voter}</span>
                                        <span className="text-sm text-gray-400 text-center">→</span>
                                        <span className="text-sm font-semibold text-red-300 text-right">{target}</span>
                                        {allianceText && <span className="text-xs text-gray-400 italic">{allianceText}</span>}
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            : event.type === "event" && event.numPlayers === 2 ?
                              <div
                                className={`bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-xs sm:text-base font-semibold ${
                                  event.images ? "" : "py-4 px-8"
                                }`}
                              > 
                                {(event.message.map((element, index) => (
                                  <div key={index}>
                                    <div dangerouslySetInnerHTML={{ __html: element }} />
                                    <div className="h-2"/>
                                  </div>
                                )))}
                              </div>
                              : <div
                                  className={`bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-xs sm:text-base font-semibold ${
                                    event.images ? "" : "py-4 px-8"
                                  }`}
                                > <div dangerouslySetInnerHTML={{ __html: event.message }} />
                                </div>
                            }

                          </div> : <></>
                          }
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
              <div className="flex flex-col justify-center items-center">
                <h2 className="text-xl text-stone-200 font-bold">Configure your cast</h2>
                <p className="text-base text-stone-200">Edit player names and images by clicking on them!</p>
                <p className="text-base mb-5 text-stone-200">Then click "Simulate" to start the simulation!</p>

                {/* Hide Sliders Toggle Checkbox */}
                <div className=" flex items-center">
                  <input
                    type="checkbox"
                    id="hideSliders"
                    checked={hideSliders}
                    onChange={() => setHideSliders((prev) => !prev)}
                    className="mr-2 w-4 h-4"
                  />
                  <label htmlFor="hideSliders" className="text-white text-sm">Hide Statistics</label>
                </div>
              </div>

              {/*3 Columns*/}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                {/*Left Column*/}
                <div className="flex flex-col items-center justify-center">
                  <input
                    type="text"
                    value={tribeNames.tribe1}
                    onChange={(e) => setTribeNames({ ...tribeNames, tribe1: e.target.value })}
                    className="w-auto bg-transparent text-xl font-bold text-blue-400 text-center border-b-2 border-blue-400 focus:outline-none"
                  />
                  <div className="h-5" />
                  <PlayerConfig
                    gender="men"
                    players={playerConfig}
                    updatePlayers={updatePlayers}
                    careers={careersData}
                    regions={regionsData}
                    tribes={tribesData}
                    hideSliders={hideSliders}
                    tribeSize={tribeSize}
                  />
                </div>

                {/*Middle Column*/}
                <div className="flex flex-col items-center justify-start">
                  <input
                    type="text"
                    placeholder={"Merge Tribe Name"}
                    onChange={(e) => setTribeNames({ ...tribeNames, merge: e.target.value })}
                    className="w-auto bg-transparent text-xl font-bold text-purple-400 text-center border-b-2 border-purple-400 focus:outline-none"
                  />

                  <div className="h-4" />
                  <div className="flex flex-col items-center">
                    <h2 className="font-bold text-white mb-2">Select Tribe Size</h2>
                    
                    <input 
                      type="range" 
                      min="7" 
                      max="15" 
                      value={tribeSize} 
                      onChange={(e) => setTribeSize(Number(e.target.value))} 
                      className="w-3/4 sm:w-full h-1 sm:h-2 mb-2 sm:mb-0 bg-stone-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                    <p className="text-white">{`Tribe Size: ${tribeSize} (${tribeSize * 2} Total Players)`}</p>
                  </div>
                  <div className="h-4" />
                  <h3 className="text-white font-bold mb-2">Select Advantages</h3>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={advantages.immunityIdol}
                        onChange={() => setAdvantages(prev => ({
                          ...prev,
                          immunityIdol: !prev.immunityIdol
                        }))}
                        className="w-4 h-4"
                      />
                      <span className="text-white">Immunity Idol (one per tribe)</span>
                    </label>
                    {/* Future checkboxes can be added here */}
                  </div>
                </div>

                {/*Left Column*/}
                <div className="flex flex-col items-center justify-center">
                  <input
                    type="text"
                    value={tribeNames.tribe2}
                    onChange={(e) => setTribeNames({ ...tribeNames, tribe2: e.target.value })}
                    className="w-auto bg-transparent text-xl font-bold text-red-400 text-center border-b-2 border-red-400 focus:outline-none"
                  />
                  <div className="h-5" />
                  <PlayerConfig
                    gender="women"
                    players={playerConfig}
                    updatePlayers={updatePlayers}
                    careers={careersData}
                    regions={regionsData}
                    tribes={tribesData}
                    hideSliders={hideSliders}
                    tribeSize={tribeSize}
                  />
                </div>

              </div>
              <div className="h-5" />

              {/*Below the 3 columns*/}
              <h2 className="text-xl font-bold mt-8">Add Custom Events</h2>
              <form onSubmit={addCustomEvent} className="bg-stone-800 p-4 rounded-lg">
                <label className="text-gray-300 text-sm">Description</label>
                <input
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Use 'Player1' and 'Player2' as placeholders (max 2 players) Example: Player1 argued with Player2."
                  className="w-full p-2 rounded border border-gray-600 bg-stone-800 text-white focus:outline-none focus:border-blue-400 text-xs sm:text-base"
                />
                
                <div className="h-2"/>
                <label className="text-gray-300 text-sm">Relationship Impact (only used if event has 2 players)</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-2 rounded border border-gray-700 bg-stone-800 text-white focus:outline-none focus:border-blue-400"
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
                      className="w-full p-2 rounded border border-gray-700 bg-stone-800 text-white focus:outline-none focus:border-blue-400"
                    />
                  </>
                )}
                <div className="h-2"/>
                <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">Add Event</button>
              </form>

              {/* Use only Custom Events Checkbox */}
              <div className=" flex items-center mt-6">
                <input
                  type="checkbox"
                  id="useOnlyCustomEvents"
                  checked={useOnlyCustomEvents}
                  onChange={() => setUseOnlyCustomEvents((prev) => !prev)}
                  className="mr-2 w-4 h-4"
                />
                <label htmlFor="useOnlyCustomEvents" className="text-white text-sm">Only use custom events (if any entered)</label>
              </div>

              <h3 className="text-lg font-bold mt-4">Custom Events</h3>
              {customEvents.length === 0 ? (
                <p className="text-gray-400">No custom events added yet.</p>
              ) : (
                <ul className="text-white space-y-1">
                  <div className="mt-4 space-y-2">
                    {customEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between bg-stone-800 text-white px-4 py-2 rounded-lg shadow-md">
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

              <h2 className="text-xl font-bold mt-8">Add Custom Alliance Name</h2>
              <form onSubmit={addCustomAllianceName} className="bg-stone-800 p-4 rounded-lg">
                <input
                  type="text"
                  value={customAllianceDescription}
                  onChange={(e) => setCustomAllianceDescription(e.target.value)}
                  placeholder="Custom Alliance name"
                  className="w-full p-2 rounded border border-gray-600 bg-stone-800 text-white focus:outline-none focus:border-blue-400 text-xs sm:text-base"
                />
                
                <div className="h-2"/>
                <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">Add Alliance Name</button>
              </form>

              <h3 className="text-lg font-bold mt-4">Custom alliance Names</h3>
              {customAllianceNames.length === 0 ? (
                <p className="text-gray-400">No custom alliance names added yet.</p>
              ) : (
                <ul className="text-white space-y-1">
                  <div className="mt-4 space-y-2">
                    {customAllianceNames.map((name, index) => (
                      <div key={index} className="flex items-center justify-between bg-stone-800 text-white px-4 py-2 rounded-lg shadow-md">
                        <span>
                          {name}
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
            </div>
          )}

          {/*BOTTOM BUTTON SETS*/}
          <div id="interface" className="text-center mt-8 mb-20">
            {mode === "configure" ? (
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold"
                onClick={startSimulation}
              >
                SIMULATE
              </button>
            ) : (
              <div className="text-center p-4 text-white">
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={prevEpisode}
                    className={`px-4 py-2 rounded ${currentEpisode === 0 ? "bg-stone-600" : "bg-blue-500"}`}
                  >
                    Previous
                  </button>

                  <button
                    className="bg-stone-500 text-white px-6 py-3 rounded-lg font-bold"
                    onClick={() => {resetSimulation();window.scrollTo({ top: 0 });setMode("configure");}}
                  >
                    BACK TO CONFIGURE
                  </button>

                  <button
                    onClick={nextEpisode}
                    className={`px-4 py-2 rounded ${currentEpisode === episodes.length - 1 ? "bg-stone-600" : "bg-green-500"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
      <Footer />
      </main>
      </div>
    </div>
  );
}
