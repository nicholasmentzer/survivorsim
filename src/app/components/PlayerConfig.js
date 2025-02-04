"use client";
import React, { useState } from "react";

const PlayerConfig = ({ gender, players, careers, regions, tribeData }) => {
    console.log("Gender:", gender);
console.log("Players:", players);
console.log("Careers:", careers);
console.log("Regions:", regions);
console.log("Tribe Data:", tribeData);
  const [playerData, setPlayerData] = useState(players[gender]);

  const updatePlayerProperty = (playerIndex, prop, value) => {
    setPlayerData((prevPlayerData) =>
      prevPlayerData.map((player, index) =>
        index === playerIndex ? { ...player, [prop]: value } : player
      )
    );
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
      <div className="flex items-center space-x-2 mb-4" key={`${label}-${num}`}>
        <label className="flex-1 text-gray-500 text-xs truncate">{labels[num]}</label>
        <input
          type="range"
          min="1"
          max="10"
          value={player[label]}
          onChange={(e) => updatePlayerProperty(playerIndex, label, e.target.value)}
          className="flex-1"
        />
        <span className="text-xs text-gray-600 w-8 text-center">{player[label]}</span>
      </div>
    );
  };

  return (
    <div
      id="players"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {playerData.map((player, index) => (
        <div
          key={player.id}
          className="player border border-gray-300 rounded p-4 space-y-3 w-[330px] mx-auto bg-slate-900 shadow-md"
        >
          <h4 className="text-lg font-semibold">{player.name}</h4>
          {renderSlider(player, index, "premerge", 0)}
          {renderSlider(player, index, "postmerge", 1)}
          {renderSlider(player, index, "likeability", 2)}
          {renderSlider(player, index, "threat", 3)}
          {renderSlider(player, index, "strategicness", 4)}
        </div>
      ))}
    </div>
  );
};

export default PlayerConfig;
