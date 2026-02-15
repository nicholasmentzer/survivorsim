// app/components/SummaryView.js
"use client";

import React from "react";
// Removed DataTable import
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function SummaryView({ finalPlacements }) {

  const sortedPlacements = [...(finalPlacements || [])].sort((a, b) => a.placement - b.placement);
  // Show all players for votes, order least to most
  const votesReceivedSorted = [...(finalPlacements || [])]
    .sort((a, b) => (a.votesReceived ?? 0) - (b.votesReceived ?? 0));
  // Only players with idols played > 0, order by idols played desc, then votes negated desc
  const idolsPlayedSorted = [...(finalPlacements || [])]
    .filter(p => (p.idolsPlayed ?? 0) > 0)
    .sort((a, b) => {
      if ((b.idolsPlayed ?? 0) !== (a.idolsPlayed ?? 0)) {
        return (b.idolsPlayed ?? 0) - (a.idolsPlayed ?? 0);
      }
      return (b.votesNegated ?? 0) - (a.votesNegated ?? 0);
    });

  if (!sortedPlacements.length) return null;

  return (
    <>
      <section className="w-full text-stone-50">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-1 mb-6">
            <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
              Simulation · Results
            </p>
            <h2
              className="
                text-3xl sm:text-4xl
                tracking-[0.22em] uppercase
              "
              style={{ fontFamily: "Bebas Neue, system-ui, sans-serif" }}
            >
              Final Placements
            </h2>
          </div>

          {/* Placements grid */}
          <div
            className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {sortedPlacements.map((player) => {
              const isWinner = player.placement === 1;
              const placementLabel = isWinner ? "Winner" : `#${player.placement}`;

              return (
                <Card
                  key={player.name}
                  className={`
                    relative overflow-hidden
                    bg-black/70 border-white/10 backdrop-blur-md
                    flex items-center cursor-pointer
                    transition-transform duration-150 hover:-translate-y-1
                    hover:border-blue-400/60
                    ${
                      isWinner
                        ? "border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.45)]"
                        : ""
                    }
                  `}
                >
                  {isWinner && (
                    <div
                      className="
                      absolute inset-x-0 top-0
                      h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500
                    "
                    />
                  )}

                  <CardContent className="flex items-center gap-3 py-3 pl-3 pr-4 w-full">
                    {/* Avatar */}
                    <Avatar
                      className={`
                      w-14 h-14 sm:w-16 sm:h-16 border
                      ${isWinner ? "border-amber-300" : "border-white/30"}
                      shadow-md
                    `}
                    >
                      <AvatarImage
                        src={player.image || "/default-player.png"}
                        alt={player.name}
                        className="object-cover"
                        style={{ imageRendering: "high-quality" }}
                      />
                      <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
                        {player.name?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Text */}
                    <div className="flex-1 min-w-0 text-left">
                      <p
                        className={`
                        text-sm sm:text-base font-semibold
                        leading-tight break-words
                        ${isWinner ? "text-amber-100" : "text-stone-50"}
                      `}
                      >
                        {player.name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
                        {placementLabel}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stat Lists Side by Side on Large Screens */}
          <div className="mt-10 flex flex-col lg:flex-row gap-8 justify-center items-start">
            {/* Votes Received Section */}
            <div className="flex-1 max-w-xs mx-auto">
              <h3 className="text-lg font-bold mb-2 text-center text-blue-300 tracking-wide">Votes Received</h3>
              <ul className="divide-y divide-blue-900/20 bg-blue-950/60 rounded-lg shadow-md">
                {votesReceivedSorted.length === 0 && (
                  <li className="py-2 text-center text-stone-300 text-sm">No votes were cast this season.</li>
                )}
                {votesReceivedSorted.map((player, idx) => {
                  const voteCount = player.votesReceived ?? 0;
                  return (
                    <li key={player.name} className="flex items-center gap-2 px-3 py-2 text-sm min-h-0">
                      <span className="font-bold text-blue-200 w-6 text-right">{idx + 1}.</span>
                      <span className="flex-1 font-medium text-stone-100 truncate">{player.name}</span>
                      <span className="text-blue-200 font-semibold">{voteCount}</span>
                      <span className="text-xs text-stone-400 ml-1">{voteCount === 1 ? 'vote' : 'votes'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Idols Played Section */}
            <div className="flex-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-2 text-center text-amber-300 tracking-wide">Idols Played & Votes Negated</h3>
              <ul className="divide-y divide-amber-900/20 bg-amber-950/60 rounded-lg shadow-md">
                {idolsPlayedSorted.length === 0 && (
                  <li className="py-2 text-center text-stone-300 text-sm">No idols were played this season.</li>
                )}
                {idolsPlayedSorted.map((player, idx) => {
                  const idolCount = player.idolsPlayed ?? 0;
                  const votesNegated = player.votesNegated ?? 0;
                  return (
                    <li key={player.name} className="flex items-center gap-2 px-3 py-2 text-sm min-h-0">
                      <span className="font-bold text-amber-200 w-6 text-right">{idx + 1}.</span>
                      <span className="flex-1 font-medium text-stone-100 truncate">{player.name}</span>
                      <span className="text-amber-200 font-semibold">{idolCount}</span>
                      <span className="text-xs text-stone-400 ml-1">{idolCount === 1 ? 'idol' : 'idols'}</span>
                      <span className="text-amber-200 font-semibold ml-4">{votesNegated}</span>
                      <span className="text-xs text-stone-400 ml-1">{votesNegated === 1 ? 'vote negated' : 'votes negated'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
