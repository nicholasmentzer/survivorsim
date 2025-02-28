"use client";
import React, { useState, useEffect } from "react";
import playersData from "../data/players.json";

const PlayerConfig = ({ gender, players, updatePlayers, careers, regions, tribeData, hideSliders, tribeSize }) => {
  const [playerData, setPlayerData] = useState(players[gender]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageValid, setImageValid] = useState(true);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    setPlayerData(players[gender].slice(0, tribeSize));
  }, [players, tribeSize, gender]);

  const presetPlayers = [...playersData.men, ...playersData.women];

  const assignPresetCharacter = (playerIndex, selectedName) => {
    const selectedPreset = presetPlayers.find(preset => preset.name === selectedName);
    
    if (selectedPreset) {
      const updatedPlayers = playerData.map((player, index) =>
        index === playerIndex
          ? { ...player, name: selectedPreset.name, image: selectedPreset.image }
          : player
      );
  
      setPlayerData(updatedPlayers);
      updatePlayers(gender, updatedPlayers);
    }
  };

  const updatePlayerProperty = (playerIndex, prop, value) => {
    const updatedPlayers = playerData.map((player, index) =>
      index === playerIndex ? { ...player, [prop]: value } : player
    );

    setPlayerData(updatedPlayers);
    updatePlayers(gender, updatedPlayers);
  };

  const openImageModal = (playerIndex) => {
    setSelectedPlayer(playerIndex);
    setImageUrl(playerData[playerIndex].image || "");
    setImageValid(true);
    setModalOpen(true);
  };

  const validateImage = (url) => {
    if (!url) {
      setImageValid(false);
      return;
    }
    
    const img = new Image();
    img.src = url;
    img.onload = () => setImageValid(true);
    img.onerror = () => setImageValid(false);
  };

  const saveImage = () => {
    if (imageValid && selectedPlayer !== null) {
      updatePlayerProperty(selectedPlayer, "image", imageUrl);
      setModalOpen(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2000000) { // 2MB limit
        alert("File is too large! Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setImageValid(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderSlider = (player, playerIndex, label, num) => {
    const labels = [
      "challenge skill (pre-merge)",
      "challenge skill (post-merge)",
      "general likeability",
      "perceived threat level",
      "strategy ability",
    ];
  
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between space-x-2 mb-4" key={`${label}-${num}`}>
        <label className="w-24 sm:w-40 mb-2 sm:mb-0 text-gray-300 text-[10px] sm:text-xs text-center sm:text-left">{labels[num]}</label>
  
        <input
          type="range"
          min="1"
          max="10"
          value={player[label]}
          onChange={(e) => updatePlayerProperty(playerIndex, label, Number(e.target.value))}
          className="w-3/4 sm:w-full h-1 sm:h-2 mb-2 sm:mb-0 bg-stone-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />

        <span className="w-8 text-sm text-gray-400 text-center">{player[label]}</span>
      </div>
    );
  };

  const categorizedPlayers = presetPlayers.reduce((acc, player) => {
    acc[player.show] = acc[player.show] || [];
    acc[player.show].push(player);
    return acc;
  }, {});

  const toggleCategory = (show) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [show]: !prev[show],
    }));
  };

  return (
    <>
      <div
        id="players"
        className="grid grid-cols-2 sm:grid-cols-1 gap-6"
      >
        {playerData.map((player, index) => (
          <div
              key={player.id}
              className="player relative border border-gray-300 rounded p-4 space-y-3 w-auto sm:w-[330px] mx-auto bg-stone-900 shadow-md flex flex-col items-center"
            >
              {/*<div className="absolute top-2 left-2">
                <select
                  className="bg-stone-800 text-white text-xs px-2 py-1 rounded w-[18px]"
                  onChange={(e) => assignPresetCharacter(index, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select Preset</option>
                  {presetPlayers
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name)).map((preset, index) => (
                      <option key={index} value={preset.name}>{preset.name}</option>
                  ))}
                </select>
              </div>*/}
              <button
              onClick={() => { setSelectedPlayerIndex(index); setSelectModalOpen(true); }}
                className="absolute top-2 left-2 bg-stone-800 text-stone-400 text-xs px-2 py-1 rounded hover:bg-stone-700"
              >
                Presets
              </button>
              <div className="relative w-16 h-16 sm:w-24 sm:h-24">
                {/* Character Image */}
                <img
                  src={player.image || "/default-player.png"}
                  alt={player.name}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-full cursor-pointer border-2 border-gray-500"
                  onClick={() => openImageModal(index)}
                  style={{ imageRendering: "high-quality" }} 
                />

                {/* Edit Icon Overlay */}
                <div 
                  className="absolute bottom-1 right-1 bg-gray-900 bg-opacity-70 p-1 rounded-full cursor-pointer"
                  onClick={() => openImageModal(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>
              </div>

              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerProperty(index, "name", e.target.value)}
                className="w-full text-sm sm:text-lg font-semibold text-center bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400 text-white"
              />

              {!hideSliders && (
                <>
                  {renderSlider(player, index, "premerge", 0)}
                  {renderSlider(player, index, "postmerge", 1)}
                  {renderSlider(player, index, "likeability", 2)}
                  {renderSlider(player, index, "threat", 3)}
                  {renderSlider(player, index, "strategicness", 4)}
                </>
              )}

            </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-stone-900 p-6 rounded-lg shadow-lg w-96 text-white">
            <h2 className="text-xl font-bold text-center mb-4">Update Player Image</h2>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                validateImage(e.target.value);
              }}
              placeholder="Enter Image URL"
              className="w-full p-2 rounded border border-gray-700 bg-stone-800 text-white focus:outline-none focus:border-blue-400"
            />

            <div className="text-center my-3">
              <span className="text-gray-400 text-sm">OR</span>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-sm text-gray-400 border border-gray-700 rounded p-1 bg-stone-800 cursor-pointer"
            />

            <div className="flex justify-center my-4">
              {imageValid ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-full border-2 border-gray-500"
                  style={{ imageRendering: "high-quality" }} 
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center text-red-500 border-2 border-red-500 rounded-full">
                  Invalid Image
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-stone-500 text-white rounded-lg"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  imageValid ? "bg-blue-500 hover:bg-blue-600" : "bg-stone-600 cursor-not-allowed"
                }`}
                onClick={saveImage}
                disabled={!imageValid}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {selectModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setSelectModalOpen(false)}>
          <div className="bg-stone-900 p-6 rounded-lg shadow-lg text-stone-200 max-h-[80vh] overflow-auto w-3/4 2xl:w-1/2" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-center mb-4">Select a Preset Character</h2>

            {Object.keys(categorizedPlayers).sort().map((show) => (
              <div key={show} className="mb-4">
                <button
                  onClick={() => toggleCategory(show)}
                  className="flex items-center justify-center w-full text-lg font-semibold text-stone-300"
                >
                  {show}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ml-2 transform ${expandedCategories[show] ? "rotate-180" : "rotate-0"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {expandedCategories[show] && (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2 mt-2 ml-[10%] mr-[10%]" >
                    {categorizedPlayers[show]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {assignPresetCharacter(selectedPlayerIndex, preset.name); setSelectModalOpen(false);}}
                          className="relative flex items-center justify-center w-full aspect-square bg-gray-700 text-white rounded-lg overflow-hidden group"
                          style={{
                            maxWidth: "120px",
                          }}
                        >
                          <img
                            src={preset.image}
                            onError={(e) => (e.target.style.display = "none")}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            alt={preset.name}
                          />

                          <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 transition-opacity duration-300"></div>

                          <span className="relative z-10 text-xs font-bold text-white text-center pl-2 pr-2">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => setSelectModalOpen(false)}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default PlayerConfig;
