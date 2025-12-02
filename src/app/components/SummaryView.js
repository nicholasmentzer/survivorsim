// app/components/SummaryView.js
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function SummaryView({ finalPlacements }) {

  const sortedPlacements = [...(finalPlacements || [])].sort(
    (a, b) => a.placement - b.placement
  );

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
        </div>
      </section>
    </>
  );
}
