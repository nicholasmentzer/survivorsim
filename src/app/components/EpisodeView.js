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
                    {event.images && !(event.type === "event" && event.numPlayers === 2) ? (
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
                      <Card className="bg-black/70 border-white/10 backdrop-blur-md w-full sm:w-4/5 md:w-2/3">
                        <CardContent className="pt-3 pb-3">
                          {(() => {
                            const stripTags = (html) =>
                              typeof html === "string" ? html.replace(/<[^>]+>/g, "").trim() : "";

                            const extraLines = [];
                            const structuredVotes = [];

                            (event.message || []).forEach((vote) => {
                              if (typeof vote !== "string") return;

                              const hasVoted = vote.includes("voted for");
                              const hasRevoted = vote.includes("revoted for");

                              if (!hasVoted && !hasRevoted) {
                                // Intro / flavor / rocks / revote explanation lines
                                extraLines.push(vote);
                                return;
                              }

                              let action = "voted for";
                              if (hasRevoted) {
                                action = "revoted for";
                              }

                              const voteParts = vote.split(` ${action} `);
                              const voterRaw = voteParts[0] || "";
                              let targetRaw = voteParts[1] || "";

                              let allianceText = "";
                              if (targetRaw.includes(" with ")) {
                                const parts = targetRaw.split(" with ");
                                targetRaw = parts[0];
                                allianceText = stripTags(parts[1] || "");
                              }

                              const voter = stripTags(voterRaw);
                              const target = stripTags((targetRaw || "").replace(/\.$/, ""));

                              if (!voter || !target) return;

                              structuredVotes.push({
                                voter,
                                target,
                                allianceText,
                                action, // "voted for" or "revoted for"
                              });
                            });

                            // If we have no structured votes (e.g. rocks only), fall back to simple layout
                            if (!structuredVotes.length) {
                              return (
                                <div className="space-y-1">
                                  {(event.message || []).map((line, i) => (
                                    <div
                                      key={i}
                                      className="text-xs sm:text-sm mb-1 text-center"
                                      dangerouslySetInnerHTML={{ __html: line }}
                                    />
                                  ))}
                                </div>
                              );
                            }

                            // Heuristic: infer alliance membership for voters who share a target
                            // with an obvious alliance bloc but are missing allianceText.
                            const votesGroupedByTarget = {};

                            structuredVotes.forEach((vote) => {
                              if (!votesGroupedByTarget[vote.target]) {
                                votesGroupedByTarget[vote.target] = [];
                              }
                              votesGroupedByTarget[vote.target].push(vote);
                            });

                            Object.values(votesGroupedByTarget).forEach((group) => {
                              // Count how many times each alliance label appears for this target
                              const allianceCounts = {};
                              group.forEach((v) => {
                                if (v.allianceText) {
                                  allianceCounts[v.allianceText] =
                                    (allianceCounts[v.allianceText] || 0) + 1;
                                }
                              });

                              const entries = Object.entries(allianceCounts);
                              if (!entries.length) return;

                              // Take the "dominant" alliance for this target
                              entries.sort((a, b) => b[1] - a[1]);
                              const [dominantAlliance, dominantCount] = entries[0];

                              // Only infer if at least 2 votes are clearly labeled for this alliance,
                              // to avoid accidentally grouping random same-target votes.
                              if (dominantCount >= 2) {
                                group.forEach((v) => {
                                  if (!v.allianceText) {
                                    v.allianceText = dominantAlliance;
                                  }
                                });
                              }
                            });

                            // --- Build "votes by target" (track action per voter) ---
                            const votesByTarget = {};
                            structuredVotes.forEach(({ voter, target, allianceText, action }) => {
                              if (!votesByTarget[target]) {
                                votesByTarget[target] = {
                                  voters: [],          // [{ voter, allianceText, action }]
                                  alliances: new Set()
                                };
                              }
                              votesByTarget[target].voters.push({ voter, allianceText, action });
                              if (allianceText) {
                                votesByTarget[target].alliances.add(allianceText);
                              }
                            });

                            // --- Build "votes by alliance" and track switches on revote ---
                            const votesByAlliance = {};
                            structuredVotes.forEach(({ voter, target, allianceText, action }) => {
                              if (!allianceText) return;

                              if (!votesByAlliance[allianceText]) {
                                votesByAlliance[allianceText] = {
                                  voters: new Set(),
                                  targetCounts: {},
                                  revoteInfo: {} // voter -> { normalTargets:Set, revoteTargets:Set }
                                };
                              }

                              const bloc = votesByAlliance[allianceText];
                              bloc.voters.add(voter);
                              bloc.targetCounts[target] =
                                (bloc.targetCounts[target] || 0) + 1;

                              if (!bloc.revoteInfo[voter]) {
                                bloc.revoteInfo[voter] = {
                                  normalTargets: new Set(),
                                  revoteTargets: new Set()
                                };
                              }

                              const info = bloc.revoteInfo[voter];
                              if (action === "revoted for") {
                                info.revoteTargets.add(target);
                              } else {
                                info.normalTargets.add(target);
                              }
                            });

                            const targetEntries = Object.entries(votesByTarget).sort(
                              (a, b) => b[1].voters.length - a[1].voters.length
                            );
                            const allianceEntries = Object.entries(votesByAlliance);

                            return (
                              <div className="space-y-3">
                                {/* Optional preamble lines (revote / rocks text etc.) */}
                                {extraLines.length > 0 && (
                                  <div className="space-y-1 mb-2">
                                    {extraLines.map((line, i) => (
                                      <div
                                        key={i}
                                        className="text-xs sm:text-sm mb-1 text-center"
                                        dangerouslySetInnerHTML={{ __html: line }}
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="grid gap-3 md:grid-cols-2">
                                  {/* Votes by target */}
                                  <div className="space-y-2">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400 mb-1">
                                      Votes by target
                                    </p>
                                    {targetEntries.map(([target, { voters, alliances }]) => {
                                      const allianceNames = Array.from(alliances);

                                      return (
                                        <div
                                          key={target}
                                          className="rounded-lg bg-stone-900/75 border border-white/10 px-3 py-2 space-y-1"
                                        >
                                          <div className="flex justify-between gap-2">
                                            <span className="text-sm font-semibold text-rose-100">
                                              {target}
                                            </span>
                                            <span className="text-[11px] text-stone-300">
                                              {voters.length} vote{voters.length !== 1 && "s"}
                                            </span>
                                          </div>

                                          <p className="text-xs text-stone-200">
                                            <span className="text-stone-400">Voters:</span>{" "}
                                            {voters.map(({ voter, action }, idx) => (
                                              <span
                                                key={voter + "-" + idx}
                                                className={
                                                  action === "revoted for"
                                                    ? "text-amber-300"
                                                    : "text-stone-200"
                                                }
                                              >
                                                {idx > 0 && ", "}
                                                {voter}
                                              </span>
                                            ))}
                                          </p>

                                          {allianceNames.length > 0 && (
                                            <p className="text-[11px] text-emerald-300">
                                              Bloc: {allianceNames.join(", ")}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Alliance blocs */}
                                  {allianceEntries.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400 mb-1">
                                        Alliance blocs
                                      </p>
                                      {allianceEntries.map(([allianceName, bloc]) => {
                                        const { voters, targetCounts, revoteInfo } = bloc;

                                        // find voters who switched on revote
                                        const switches = Object.entries(revoteInfo || {})
                                          .filter(([voter, info]) => {
                                            const normalSize = info.normalTargets.size;
                                            const revoteSize = info.revoteTargets.size;
                                            // switched if they have at least one revote target
                                            // AND either had a different normal target, or multiple revote targets
                                            return (
                                              revoteSize > 0 &&
                                              (normalSize > 0 || revoteSize > 1)
                                            );
                                          })
                                          .map(([voter, info]) => {
                                            const revTargets = Array.from(
                                              info.revoteTargets
                                            ).join(", ");
                                            return `${voter} → ${revTargets}`;
                                          });

                                        return (
                                          <div
                                            key={allianceName}
                                            className="rounded-lg bg-stone-900/75 border border-emerald-500/40 px-3 py-2 space-y-1"
                                          >
                                            <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                                              {allianceName}
                                            </span>

                                            <p className="text-xs text-stone-200">
                                              <span className="text-stone-400">Voters:</span>{" "}
                                              {Array.from(voters).join(", ")}
                                            </p>

                                            <p className="text-xs text-stone-200">
                                              <span className="text-stone-400">Targets:</span>{" "}
                                              {Object.entries(targetCounts)
                                                .map(([target, count]) => `${target} ×${count}`)
                                                .join(", ")}
                                            </p>

                                            {switches.length > 0 && (
                                              <p className="text-xs text-amber-200">
                                                <span className="text-amber-300 font-semibold">
                                                  Switches:
                                                </span>{" "}
                                                {switches.join(", ")}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Individual vote list */}
                                {structuredVotes.length > 0 &&
                                  (() => {
                                    // Group original + revote by voter
                                    const votesByVoter = {};
                                    const voterOrder = [];

                                    structuredVotes.forEach(({ voter, target, allianceText, action }) => {
                                      if (!votesByVoter[voter]) {
                                        votesByVoter[voter] = {
                                          normalTargets: [],
                                          revoteTargets: [],
                                          allianceText: allianceText || "",
                                        };
                                        voterOrder.push(voter);
                                      }

                                      if (allianceText && !votesByVoter[voter].allianceText) {
                                        votesByVoter[voter].allianceText = allianceText;
                                      }

                                      if (action === "revoted for") {
                                        votesByVoter[voter].revoteTargets.push(target);
                                      } else {
                                        votesByVoter[voter].normalTargets.push(target);
                                      }
                                    });

                                    return (
                                      <div className="pt-2 space-y-1">
                                        <div className="h-px bg-white/10 my-2" />
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400 mb-1 text-center">
                                          Individual votes
                                        </p>
                                        <div className="space-y-1">
                                          {voterOrder.map((voter) => {
                                            const info = votesByVoter[voter];
                                            const hasRevote = info.revoteTargets.length > 0;

                                            // Final target shown on main row (revote target if it exists, otherwise first normal)
                                            const finalTarget =
                                              (hasRevote && info.revoteTargets[info.revoteTargets.length - 1]) ||
                                              info.normalTargets[0] ||
                                              "";

                                            return (
                                              <div
                                                key={voter}
                                                className="rounded-lg bg-stone-900/70 border border-white/5 px-3 py-1.5 text-xs sm:text-sm"
                                              >
                                                <div className="flex items-center justify-between gap-2">
                                                  <span className="font-semibold text-blue-200 truncate">
                                                    {voter}
                                                  </span>
                                                  <span className="text-gray-400">→</span>
                                                  <span className="font-semibold text-rose-200 truncate">
                                                    {finalTarget}
                                                  </span>
                                                </div>

                                                {hasRevote && (
                                                  <p className="text-[10px] text-amber-200 mt-1">
                                                    <span className="text-amber-300 font-semibold">
                                                      Round 1:
                                                    </span>{" "}
                                                    {info.normalTargets.join(", ") || "—"}{" "}
                                                    <span className="mx-1">·</span>
                                                    <span className="text-amber-300 font-semibold">
                                                      Revote:
                                                    </span>{" "}
                                                    {info.revoteTargets.join(", ")}
                                                  </p>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    ) : event.type === "event" && event.numPlayers === 2 ? (
                      // Relationship events with effect text
                      <Card className="bg-black/70 border-white/10 backdrop-blur-md w-full sm:w-4/5 md:w-2/3">
                        <CardContent className="py-3 px-4">
                          {(() => {
                            const msgs = Array.isArray(event.message)
                              ? event.message
                              : [event.message];

                            const [headline, ...rest] = msgs;
                            const secondaryHtml = rest.join("<br />");

                            // Compress "relationship + + + +" / "relationship - - -" into "+3"/"-3"
                            const plainSecondary = secondaryHtml
                              .replace(/<[^>]+>/g, "") // strip HTML tags
                              .toLowerCase();

                            const plusCount = (plainSecondary.match(/\+/g) || []).length;
                            const minusCount = (plainSecondary.match(/-/g) || []).length;

                            let chipValue = null;
                            let chipNet = 0;

                            if (plusCount || minusCount) {
                              const net = plusCount - minusCount;
                              chipNet = net;
                              if (net !== 0) {
                                const sign = net > 0 ? "+" : "";
                                chipValue = `${sign}${net}`; // e.g. "+4" / "-2"
                              }
                            }

                            const chipColorClasses =
                              chipNet > 0
                                ? "bg-emerald-900/40 border-emerald-400/60 text-emerald-200"
                                : "bg-rose-900/40 border-rose-400/60 text-rose-200";

                            return (
                              <div className="flex flex-col gap-2">
                                {/* main row: avatars + text + chip */}
                                <div className="flex items-center gap-3 w-full">
                                  {/* overlapping avatars */}
                                  {event.images && event.images.length >= 2 && (
                                    <div className="flex -space-x-3">
                                      {event.images.slice(0, 2).map((image, i) => (
                                        <Avatar
                                          key={i}
                                          className="w-12 h-12 sm:w-14 sm:h-14 border border-white/40 shadow-md bg-black/40"
                                        >
                                          <AvatarImage
                                            src={image}
                                            alt="Relationship event"
                                            className="object-cover"
                                            style={{ imageRendering: "high-quality" }}
                                          />
                                          <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
                                            ?
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                    </div>
                                  )}

                                  {/* headline text with more breathing room */}
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className="
                                        text-xs sm:text-sm font-semibold
                                        leading-snug text-center sm:text-left
                                      "
                                      dangerouslySetInnerHTML={{ __html: headline }}
                                    />
                                  </div>

                                  {/* chip on the right for larger screens */}
                                  {chipValue && (
                                    <span
                                      className={`
                                        hidden sm:inline-flex items-center justify-center
                                        rounded-full px-3 py-1
                                        text-[11px] font-semibold tracking-[0.16em]
                                        whitespace-nowrap
                                        ${chipColorClasses}
                                      `}
                                    >
                                      {chipValue}
                                    </span>
                                  )}
                                </div>

                                {/* chip below on mobile */}
                                {chipValue && (
                                  <div className="sm:hidden flex justify-center">
                                    <span
                                      className={`
                                        inline-flex items-center justify-center
                                        rounded-full px-3 py-1
                                        text-[11px] font-semibold tracking-[0.16em]
                                        ${chipColorClasses}
                                      `}
                                    >
                                      {chipValue}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
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
