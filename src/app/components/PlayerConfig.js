"use client";
import React, { useState } from "react";

const PlayerConfig = ({ gender, players, updatePlayers, careers, regions, tribeData, hideSliders }) => {
  const [playerData, setPlayerData] = useState(players[gender]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageValid, setImageValid] = useState(true);

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
      <div className="flex items-center justify-between space-x-2 mb-4" key={`${label}-${num}`}>
        <label className="w-40 text-gray-300 text-xs text-left">{labels[num]}</label>
  
        <input
          type="range"
          min="1"
          max="10"
          value={player[label]}
          onChange={(e) => updatePlayerProperty(playerIndex, label, Number(e.target.value))}
          className="w-full h-2 bg-stone-500 rounded-lg appearance-none cursor-pointer"
        />

        <span className="w-8 text-sm text-gray-400 text-center">{player[label]}</span>
      </div>
    );
  };

  return (
    <>
      <div
        id="players"
        className="grid grid-cols-1 gap-6"
      >
        {playerData.map((player, index) => (
          <div
              key={player.id}
              className="player border border-gray-300 rounded p-4 space-y-3 w-[330px] mx-auto bg-stone-900 shadow-md flex flex-col items-center"
            >
              <img
                src={player.image || "/default-player.png"}
                alt={player.name}
                className="w-24 h-24 object-cover rounded-full cursor-pointer border-2 border-gray-500"
                onClick={() => openImageModal(index)}
                style={{ imageRendering: "high-quality" }} 
              />

              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerProperty(index, "name", e.target.value)}
                className="w-full text-lg font-semibold text-center bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400 text-white"
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
    </>
  );
};

export default PlayerConfig;
