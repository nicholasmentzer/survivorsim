// app/components/EpisodeView.js
"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function EpisodeView({
  episodes,
  currentEpisode,
  prevEpisode,
  nextEpisode,
  onBackToConfigure,
  showCurrentAlliances,
  setShowCurrentAlliances,
  showAdvantages,
  setShowAdvantages,
  showRelationshipsModal,
  openRelationshipsModal,
  closeRelationshipsModal,
  alliancesModalOpen,
  openAlliancesModal,
  closeAlliancesModal,
  currentAlliances,
  selectedTribe,
  playerFilters,
  toggleFilterMode,
}) {
  const currentEvents = episodes[currentEpisode] || [];

  const renderMemberAvatar = (member, size = "md") => {
    const sizeClasses =
      size === "lg"
        ? "w-16 h-16 sm:w-20 sm:h-20"
        : "w-10 h-10 sm:w-14 sm:h-14";

    return (
      <div
        key={member.name}
        className="flex flex-col items-center text-center w-20"
      >
        <Avatar
          className={`${sizeClasses} border border-white/30 shadow-md`}
        >
          <AvatarImage
            src={member.image}
            alt={member.name}
            className="object-cover"
            style={{ imageRendering: "high-quality" }}
          />
          <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
            {member.name?.[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
        <p className="text-[10px] sm:text-xs mt-1 text-stone-100 text-center leading-tight max-w-[5rem]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {member.name}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full text-stone-50">
      <section className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        {/* Episode header */}
        <div className="flex flex-col items-center gap-1 mb-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
            Simulation · Episode
          </p>
          <h2
            className="
              text-3xl sm:text-4xl
              tracking-[0.22em] uppercase
            "
            style={{ fontFamily: "Bebas Neue, system-ui, sans-serif" }}
          >
            Episode {currentEpisode + 1}
          </h2>
        </div>

        <div className="space-y-8 pb-10">
          {currentEvents.map((event, index) => {
            // --- Tribe block (camp / tribe status) ---
            if (event.type === "tribe") {
              return (
                <Card
                  key={index}
                  className="bg-black/60 border-white/10 backdrop-blur-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-left">
                        <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
                          Tribe Events
                        </p>
                        <CardTitle
                          className="
                            text-lg sm:text-xl
                            text-stone-50
                            tracking-[0.12em] uppercase
                          "
                        >
                          {event.title} Events
                        </CardTitle>
                      </div>

                      <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="
                            h-8 px-3
                            text-[10px] tracking-[0.14em] uppercase
                            border-white/20 bg-white/5 hover:bg-white/10
                          "
                          onClick={() => openRelationshipsModal(event.members)}
                        >
                          View Relationships
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="
                            h-8 px-3
                            text-[10px] tracking-[0.14em] uppercase
                            border-white/20 bg-white/5 hover:bg-white/10
                          "
                          onClick={() => openAlliancesModal(event.alliances)}
                        >
                          View Alliances
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    <Separator className="bg-white/10 mb-3" />
                    <div className="flex flex-wrap justify-center gap-3">
                      {event.members?.map((member) =>
                        renderMemberAvatar(member, "lg")
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // --- Alliance blocks (current alliances / new alliances) ---
            if (event.type === "alliance") {
              const isCurrent = event.title === "Current Alliances";

              return (
                <Card
                  key={index}
                  className="bg-black/60 border-white/10 backdrop-blur-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-left">
                        <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
                          Alliances
                        </p>
                        <CardTitle
                          className="
                            text-lg sm:text-xl
                            text-stone-50
                            tracking-[0.12em] uppercase
                          "
                        >
                          {event.title}
                        </CardTitle>
                      </div>

                      {isCurrent && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 hover:bg-white/5"
                          onClick={() =>
                            setShowCurrentAlliances((prev) => !prev)
                          }
                        >
                          {showCurrentAlliances ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-blue-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-blue-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-1 pb-4">
                    {isCurrent && !showCurrentAlliances ? (
                      <p className="text-xs text-stone-400">
                        Alliances hidden. Tap the arrow to reveal.
                      </p>
                    ) : null}

                    {(isCurrent ? showCurrentAlliances : true) &&
                      event.alliances.map((alliance, i) => (
                        <div
                          key={i}
                          className="
                            mt-1 p-3 sm:p-4
                            bg-stone-900/70 border border-white/10
                            rounded-lg shadow-md
                          "
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <div></div>
                            <h4 className="text-sm sm:text-base font-semibold text-stone-50">
                              {alliance.name}
                            </h4>
                            <span className="text-[11px] text-stone-300">
                              Strength: {alliance.strength}
                            </span>
                          </div>

                          <div className="flex flex-wrap justify-center gap-3 mt-3">
                            {alliance.members.map((member) =>
                              renderMemberAvatar(member, "md")
                            )}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              );
            }

            // --- Idols / advantages summary ---
            if (event.type === "idols") {
              const idols = event.idols || {};
              const activeIdols = Object.entries(idols).filter(
                ([, player]) => !!player
              );
              const hasIdols = activeIdols.length > 0;

              return (
                <Card
                  key={index}
                  className="bg-black/60 border-white/10 backdrop-blur-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-left">
                        <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
                          Advantages
                        </p>
                        <CardTitle
                          className="
                            text-lg sm:text-xl
                            text-stone-50
                            tracking-[0.12em] uppercase
                          "
                        >
                          Current Advantages
                        </CardTitle>
                        <p className="text-[11px] text-stone-400 mt-1">
                          {hasIdols
                            ? `${activeIdols.length} advantage${
                                activeIdols.length > 1 ? "s" : ""
                              } in play`
                            : "No advantages in play this episode"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-1 pb-4">
                     {hasIdols ? (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {activeIdols.map(([tribeKey, player]) => (
                            <div
                              key={tribeKey}
                              className="
                                flex items-center justify-between gap-3
                                rounded-lg border border-white/10
                                bg-stone-900/70 px-3 py-3
                                shadow-md
                              "
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border border-white/30 shadow">
                                  <AvatarImage
                                    src={player.image}
                                    alt={player.name}
                                    className="object-cover"
                                    style={{ imageRendering: "high-quality" }}
                                  />
                                  <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
                                    {player.name?.[0] ?? "?"}
                                  </AvatarFallback>
                                </Avatar>

                                <p className="text-xs sm:text-sm font-semibold text-stone-50">
                                  {player.name}
                                </p>
                              </div>

                              <span
                                className="
                                  inline-flex items-center justify-center
                                  rounded-full px-3 py-1
                                  text-[10px] sm:text-xs font-semibold
                                  bg-amber-500/15 text-amber-200
                                  border border-amber-400/40
                                  uppercase tracking-[0.14em]
                                "
                              >
                                Hidden Immunity Idol
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="
                            mt-3 rounded-lg border border-dashed border-stone-600
                            bg-stone-900/40 px-4 py-6
                            text-center text-xs sm:text-sm text-stone-400
                          "
                        >
                          No idols or other advantages are currently in play.
                        </div>
                      )
                    }
                  </CardContent>
                </Card>
              );
            }

            // --- Alliance target planning ---
            if (event.type === "allianceTarget") {
              return (
                <Card
                  key={index}
                  className="bg-black/60 border-white/10 backdrop-blur-md max-w-3xl mx-auto"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap justify-center gap-3 mb-3">
                      {event.alliance.members.map((member) =>
                        renderMemberAvatar(member, "md")
                      )}
                    </div>
                    <div
                      className={`
                        bg-stone-900/80 text-white
                        px-4 sm:px-6 pt-4 pb-4
                        rounded-lg shadow-md
                        text-xs sm:text-sm font-semibold text-center
                      `}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: event.message }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // --- Immunity challenge ---
            if (event.type === "immunity") {
              const isIndividual = event.members?.length === 1;

              return (
                <div key={index} className="space-y-3">
                  <div className="text-center mt-4">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
                      Challenge
                    </p>
                    <h3
                      className="text-xl sm:text-2xl text-stone-50 tracking-[0.16em] uppercase"
                      style={{
                        fontFamily: "Bebas Neue, system-ui, sans-serif",
                      }}
                    >
                      Immunity Challenge
                    </h3>
                  </div>

                  <Card
                    className={`
                      bg-black/60 border-white/10 backdrop-blur-md
                      ${isIndividual ? "max-w-md mx-auto" : "max-w-4xl mx-auto"}
                    `}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div
                        className="
                          bg-stone-900/80 text-white
                          px-4 sm:px-6 py-4
                          rounded-lg shadow-md
                          text-sm sm:text-base font-semibold text-center
                        "
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: event.message }}
                        />
                      </div>

                      <div className="mt-4 p-3 sm:p-4 bg-stone-900/60 rounded-lg border border-white/10">
                        <div className="flex flex-wrap justify-center gap-3">
                          {event.members?.map((member) =>
                            renderMemberAvatar(member, "lg")
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            }

            // --- Everything else: voting, summary, relationships header, generic events ---
            return (
              <div key={index} className="space-y-3">
                {/* Section headers for certain event types */}
                {event.type === "voting-summary" && (
                  <div className="text-center mt-6">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
                      Tribal Council
                    </p>
                    <h3
                      className="text-xl sm:text-2xl text-stone-50 tracking-[0.16em] uppercase"
                      style={{
                        fontFamily: "Bebas Neue, system-ui, sans-serif",
                      }}
                    >
                      Tribal Council
                    </h3>
                  </div>
                )}

                {event.type === "relationship" && (
                  <div className="text-center mt-6">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
                      Relationships
                    </p>
                    <h3
                      className="text-xl sm:text-2xl text-stone-50 tracking-[0.16em] uppercase"
                      style={{
                        fontFamily: "Bebas Neue, system-ui, sans-serif",
                      }}
                    >
                      Relationship Highlights / Targets
                    </h3>
                  </div>
                )}

                {/* Main event body (skip if pure relationship header) */}
                {event.type !== "relationship" && (
                  <div className="flex flex-col items-center space-y-3">
                    {/* Optional images above the text */}
                    {event.images ? (
                      <div className="flex gap-4">
                        {event.images.map((image, i) => (
                          <Avatar
                            key={i}
                            className="w-14 h-14 sm:w-20 sm:h-20 border border-white/30 shadow-md"
                          >
                            <AvatarImage
                              src={image}
                              alt="Event"
                              className="object-cover"
                              style={{ imageRendering: "high-quality" }}
                            />
                            <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
                              ?
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    ) : null}

                    {/* Voting summary (big reveal card) */}
                    {event.type === "voting-summary" ? (
                      <Card className="bg-black/70 border-white/10 backdrop-blur-md w-full sm:w-4/5 md:w-1/2">
                        <CardContent className="pt-3 pb-2">
                          {event.message.map((vote, i) => (
                            <div
                              key={i}
                              className="text-xs sm:text-sm font-semibold py-3 border-b border-white/5 last:border-b-0"
                              dangerouslySetInnerHTML={{ __html: vote }}
                            />
                          ))}
                        </CardContent>
                      </Card>
                    ) : event.type === "voting" ? (
                      // Detailed voting breakdown (who voted for whom)
                      <Card className="bg-black/70 border-white/10 backdrop-blur-md w-full sm:w-4/5 md:w-1/2">
                        <CardContent className="pt-3 pb-3">
                          {event.message.map((vote, i) => {
                            if (!vote.includes("voted for")) {
                              return (
                                <div
                                  key={i}
                                  className="text-xs sm:text-sm mb-1 text-center"
                                  dangerouslySetInnerHTML={{ __html: vote }}
                                />
                              );
                            }

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
                              <div
                                key={i}
                                className="grid grid-cols-3 gap-2 px-2 py-1 text-xs sm:text-sm items-center"
                              >
                                <span className="font-semibold text-blue-300 text-left truncate">
                                  {voter}
                                </span>
                                <span className="text-gray-400 text-center">
                                  →
                                </span>
                                <span className="font-semibold text-rose-300 text-right truncate">
                                  {target}
                                </span>
                                {allianceText && (
                                  <span className="col-span-3 text-[11px] text-gray-400 italic text-center">
                                    {allianceText}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ) : event.type === "event" && event.numPlayers === 2 ? (
                      // Relationship events with effect text
                      <Card className="bg-black/70 border-white/10 backdrop-blur-md w-full sm:w-4/5">
                        <CardContent className="pt-3 pb-3">
                          {event.message.map((element, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                              <div
                                className="text-xs sm:text-sm font-semibold text-center"
                                dangerouslySetInnerHTML={{ __html: element }}
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ) : (
                      // Generic text event
                      <Card className="bg-black/70 border-white/10 backdrop-blur-md w-full sm:w-4/5">
                        <CardContent className="pt-3 pb-3">
                          <div
                            className="text-xs sm:text-sm font-semibold text-center"
                            dangerouslySetInnerHTML={{
                              __html: event.message,
                            }}
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --- Alliances Modal (shadcn Dialog) --- */}
      <Dialog
        open={alliancesModalOpen}
        onOpenChange={(open) => {
          if (!open) closeAlliancesModal();
        }}
      >
        <DialogContent className="bg-stone-950 border-white/10 text-stone-50 max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold tracking-[0.12em] uppercase">
              Current Alliances
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] pr-1 space-y-4">
            {currentAlliances && currentAlliances.length > 0 ? (
              currentAlliances.map((alliance, index) => (
                <div
                  key={index}
                  className="p-4 bg-stone-900/80 rounded-lg border border-white/10"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-sm sm:text-base font-semibold">
                      {alliance.name}
                    </h3>
                    <span className="text-[11px] text-stone-300">
                      Strength: {alliance.strength}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-1">
                    {alliance.members.map((member) => (
                      <div
                        key={member.name}
                        className="flex flex-col items-center text-center w-20"
                      >
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border border-white/30 shadow-md">
                          <AvatarImage
                            src={member.image}
                            alt={member.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
                            {member.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-[10px] sm:text-xs text-stone-100 mt-1 truncate max-w-[5rem]">
                          {member.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-400 text-center">
                No alliances found for this tribe.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="w-full"
              onClick={closeAlliancesModal}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Relationships Modal (shadcn Dialog) --- */}
      <Dialog
        open={showRelationshipsModal}
        onOpenChange={(open) => {
          if (!open) closeRelationshipsModal();
        }}
      >
        <DialogContent className="bg-stone-950 border-white/10 text-stone-50 max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold tracking-[0.12em] uppercase">
              Tribe Relationships
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] pr-1 space-y-4">
            {selectedTribe?.map((player) => {
              const filterMode = playerFilters[player.name] || "extreme";

              const sortedRelationships = [...selectedTribe]
                .filter((other) => other !== player)
                .map((other) => ({
                  name: other.name,
                  score: player.relationships?.[other.name] ?? 0,
                }))
                .sort((a, b) => b.score - a.score);

              let displayedRelationships = sortedRelationships;

              if (filterMode === "extreme") {
                displayedRelationships = sortedRelationships.filter(
                  ({ score }) => Math.abs(score) >= 3
                );
              } else if (filterMode === "none") {
                displayedRelationships = [];
              }

              return (
                <div
                  key={player.name}
                  className="bg-stone-900/80 p-4 rounded-lg shadow-md border border-white/10"
                >
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      {player.name}
                    </h3>

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="
                        text-[10px] tracking-[0.14em] uppercase
                        rounded-full border-stone-500/70 bg-white/5 hover:bg-white/10
                      "
                      onClick={() => toggleFilterMode(player.name)}
                    >
                      {filterMode === "none"
                        ? "Show Important"
                        : filterMode === "all"
                        ? "Hide All"
                        : "Show All"}
                    </Button>
                  </div>

                  {displayedRelationships.length > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      {displayedRelationships.map(({ name, score }) => {
                        const bgColor =
                          score === 5
                            ? "bg-emerald-400/80"
                            : score === 4
                            ? "bg-emerald-500/80"
                            : score === 3
                            ? "bg-emerald-700/80"
                            : score === 2
                            ? "bg-emerald-800/80"
                            : score === 1
                            ? "bg-emerald-900/80"
                            : score === 0
                            ? "bg-gray-600/60"
                            : score === -5
                            ? "bg-rose-900/80"
                            : score === -4
                            ? "bg-rose-800/80"
                            : score === -3
                            ? "bg-rose-600/80"
                            : score === -2
                            ? "bg-rose-500/80"
                            : "bg-rose-300/80";

                        return (
                          <div
                            key={name}
                            className={`
                              flex justify-between items-center
                              px-3 py-1.5 rounded
                              text-xs sm:text-sm
                              ${bgColor}
                            `}
                          >
                            <span className="text-white">{name}</span>
                            <span className="font-bold text-white">
                              {score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-stone-400">
                      {filterMode === "none"
                        ? "Relationships hidden for this player."
                        : "No notable relationships yet."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="w-full"
              onClick={closeRelationshipsModal}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
