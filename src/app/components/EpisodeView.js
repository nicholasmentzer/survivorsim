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
import { Input } from "@/components/ui/input";

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
  alliancesModalContext,
  allianceNameOverrides = {},
  setAllianceNameOverrides = () => {},
  selectedTribe,
}) {
  const currentEvents = episodes[currentEpisode] || [];

  const [renameEditorsOpen, setRenameEditorsOpen] = React.useState({});

  const getAllianceKey = React.useCallback((alliance) => {
    if (alliance?.id) return `id:${alliance.id}`;
    const names = (alliance?.members || [])
      .map((m) => m?.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return names.length ? names.join("|") : "";
  }, []);

  const getAllianceDisplayName = React.useCallback(
    (alliance) => {
      const key = getAllianceKey(alliance);
      const override = key ? allianceNameOverrides?.[key] : null;
      return (override && override.trim()) || alliance?.name || "Alliance";
    },
    [allianceNameOverrides, getAllianceKey]
  );

  const setAllianceOverrideName = React.useCallback(
    (alliance, nextNameRaw) => {
      const key = getAllianceKey(alliance);
      if (!key) return;
      const nextName = (nextNameRaw || "").trim();
      setAllianceNameOverrides((prev) => {
        const next = { ...(prev || {}) };
        if (!nextName) delete next[key];
        else next[key] = nextName;
        return next;
      });
    },
    [getAllianceKey, setAllianceNameOverrides]
  );

  const displayEvents = React.useMemo(() => {
    const isLegacyPersonalTargetEvent = (evt) => {
      if (!evt || evt.type !== "event") return false;
      if (!Array.isArray(evt.images) || evt.images.length !== 2) return false;
      if (evt.numPlayers === 2) return false; // relationship events w/ effect text
      return typeof evt.message === "string" && evt.message.includes("text-red-400");
    };

    const normalized = [];
    for (let i = 0; i < currentEvents.length; i++) {
      const event = currentEvents[i];

      // Group relationship targets + alliance targets into one compact section.
      if (event?.type === "relationship") {
        const personalTargets = [];
        const allianceTargets = [];

        let j = i + 1;
        while (j < currentEvents.length) {
          const next = currentEvents[j];

          if (next?.type === "target") {
            personalTargets.push(next);
            j++;
            continue;
          }

          if (isLegacyPersonalTargetEvent(next)) {
            personalTargets.push({
              type: "target",
              legacy: true,
              messageHtml: next.message,
              images: next.images,
            });
            j++;
            continue;
          }

          if (next?.type === "allianceTarget") {
            allianceTargets.push(next);
            j++;
            continue;
          }

          break;
        }

        normalized.push({
          type: "targetsSection",
          personalTargets,
          allianceTargets,
        });

        i = j - 1;
        continue;
      }

      normalized.push(event);
    }

    return normalized;
  }, [currentEvents]);

  const idolsDisplayMeta = React.useMemo(() => {
    const idolsIndex = displayEvents.findIndex((evt) => evt?.type === "idols");
    const tribalIndex = displayEvents.findIndex(
      (evt) => evt?.type === "voting-summary"
    );
    return {
      idolsIndex,
      tribalIndex,
      idolsEvent: idolsIndex >= 0 ? displayEvents[idolsIndex] : null,
    };
  }, [displayEvents]);

  const isIdolFindEvent = React.useCallback((evt) => {
    return (
      evt?.type === "event" &&
      typeof evt?.message === "string" &&
      evt.message.includes("found a Hidden Immunity Idol")
    );
  }, []);

  const renderCurrentAdvantagesCard = (evt, { compact = false } = {}) => {
    const idols = evt?.idols || {};
    const activeIdols = Object.entries(idols).filter(([, player]) => !!player);
    const hasIdols = activeIdols.length > 0;

    return (
      <Card
        className={
          compact
            ? "bg-black/60 border-white/10 backdrop-blur-md max-w-3xl mx-auto"
            : "bg-black/60 border-white/10 backdrop-blur-md"
        }
      >
        <CardHeader className={compact ? "py-2" : "pb-2"}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-left">
              <p className="text-[10px] tracking-[0.18em] uppercase text-stone-400">
                Advantages
              </p>
              <CardTitle
                className={
                  compact
                    ? "text-base sm:text-lg text-stone-50 tracking-[0.12em] uppercase"
                    : "text-lg sm:text-xl text-stone-50 tracking-[0.12em] uppercase"
                }
              >
                Current Advantages
              </CardTitle>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {hasIdols
                  ? `${activeIdols.length} advantage${
                      activeIdols.length > 1 ? "s" : ""
                    } in play`
                  : "No advantages in play this episode"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className={compact ? "pt-0 pb-3" : "pt-1 pb-4"}>
          {hasIdols ? (
            <div className={compact ? "mt-2 grid gap-2 sm:grid-cols-2" : "mt-3 grid gap-3 sm:grid-cols-2"}>
              {activeIdols.map(([tribeKey, player]) => (
                <div
                  key={tribeKey}
                  className={
                    compact
                      ? "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-stone-900/70 px-2.5 py-2 shadow"
                      : "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-stone-900/70 px-3 py-3 shadow-md"
                  }
                >
                  <div className="flex items-center gap-3">
                    {/* Do not change icon/image sizing */}
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

                    <p className={compact ? "text-xs font-semibold text-stone-50" : "text-xs sm:text-sm font-semibold text-stone-50"}>
                      {player.name}
                    </p>
                  </div>

                  <span
                    className={
                      compact
                        ? "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/40 uppercase tracking-[0.14em]"
                        : "inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] sm:text-xs font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/40 uppercase tracking-[0.14em]"
                    }
                  >
                    Hidden Immunity Idol
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={
                compact
                  ? "mt-2 rounded-lg border border-dashed border-stone-600 bg-stone-900/40 px-3 py-4 text-center text-xs text-stone-400"
                  : "mt-3 rounded-lg border border-dashed border-stone-600 bg-stone-900/40 px-4 py-6 text-center text-xs sm:text-sm text-stone-400"
              }
            >
              No idols or other advantages are currently in play.
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const originRingPalette = [
    "ring-amber-200/75",
    "ring-violet-300/75",
    "ring-teal-300/75",
    "ring-sky-300/75",
    "ring-rose-300/75",
    "ring-stone-200/75",
  ];

  const getOriginRingClass = (member) => {
    const originId = member?.originalTribeId ?? member?.tribeId;
    if (!Number.isFinite(originId) || originId <= 0) return "";
    return originRingPalette[(originId - 1) % originRingPalette.length];
  };

  const tribeTitlePalette = [
    "text-amber-200",
    "text-violet-300",
    "text-teal-300",
    "text-sky-300",
    "text-rose-300",
    "text-stone-200",
  ];

  const getTribeTitleClass = (tribeId) => {
    if (!Number.isFinite(tribeId) || tribeId <= 0) return "text-stone-50";
    return tribeTitlePalette[(tribeId - 1) % tribeTitlePalette.length];
  };

  const renderMemberAvatar = (member, size = "md", opts = {}) => {
    const sizeClasses =
      size === "lg"
        ? "w-16 h-16 sm:w-20 sm:h-20"
        : "w-10 h-10 sm:w-14 sm:h-14";
    const isOffTribe = !!opts?.offTribe;

    const originRingClass = getOriginRingClass(member);
    const offTribeAvatarClass = isOffTribe
      ? "opacity-55 grayscale scale-90"
      : "";
    const offTribeNameClass = isOffTribe ? "text-stone-400" : "text-stone-100";

    return (
      <div
        key={member.name}
        className="flex flex-col items-center text-center w-20"
      >
        <Avatar
          className={`${sizeClasses} border border-white/25 shadow-md ring-1 ${originRingClass} ${offTribeAvatarClass} transition-transform`}
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
        <p className={`text-[10px] sm:text-xs mt-1 ${offTribeNameClass} text-center leading-tight max-w-[5rem]`}
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

  const getRelationshipBgClass = (score) => {
    // Relationship grid readability:
    // - 5s and 4s should pop (high contrast + ring)
    // - 3s slightly more emphasized, but less than 4/5
    // Return a full class string (bg + text + border + optional ring).
    return score === 5
      ? "bg-emerald-500/95 text-white border-white/30 ring-2 ring-white/70 ring-inset font-extrabold shadow-md"
      : score === 4
      ? "bg-emerald-600/90 text-white border-white/20 ring-1 ring-white/40 ring-inset"
      : score === 3
      ? "bg-emerald-700/85 text-white border-white/10"
      : score === 2
      ? "bg-emerald-800/85 text-white border-white/10"
      : score === 1
      ? "bg-emerald-900/85 text-white border-white/10"
      : score === 0
      ? "bg-gray-600/65 text-white border-white/10"
      : score === -5
      ? "bg-rose-500/95 text-white border-white/30 ring-2 ring-white/70 ring-inset font-extrabold shadow-md"
      : score === -4
      ? "bg-rose-600/90 text-white border-white/20 ring-1 ring-white/40 ring-inset"
      : score === -3
      ? "bg-rose-700/85 text-white border-white/10"
      : score === -2
      ? "bg-rose-800/85 text-white border-white/10"
      : "bg-rose-900/85 text-white border-white/10";
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
          {displayEvents.map((event, index) => {
            // --- Condensed targets section (personal + alliance targets) ---
            if (event.type === "targetsSection") {
              const personalTargets = event.personalTargets || [];
              const allianceTargets = event.allianceTargets || [];

              const escapeHtml = (input) => {
                if (typeof input !== "string") return "";
                return input
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\"/g, "&quot;")
                  .replace(/'/g, "&#39;");
              };

              const highlightNamesHtml = (message, actorName, targetName) => {
                const msgEsc = escapeHtml(message || "");
                const actorEsc = escapeHtml(actorName || "");
                const targetEsc = escapeHtml(targetName || "");

                // Replace longer name first to avoid partial overlaps.
                const pairs = [
                  // Match alliance target styling.
                  { value: actorEsc, cls: "text-blue-300 font-bold" },
                  { value: targetEsc, cls: "text-rose-200 font-bold" },
                ].filter((p) => p.value);
                pairs.sort((a, b) => b.value.length - a.value.length);

                let out = msgEsc;
                for (const p of pairs) {
                  out = out.split(p.value).join(`<span class=\"${p.cls}\">${p.value}</span>`);
                }
                return out;
              };

              const renderMiniAvatar = (image, alt) => (
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border border-white/25 bg-black/30">
                  <AvatarImage
                    src={image}
                    alt={alt}
                    className="object-cover"
                    style={{ imageRendering: "high-quality" }}
                  />
                  <AvatarFallback className="bg-stone-700 text-[10px] text-stone-100">
                    ?
                  </AvatarFallback>
                </Avatar>
              );

              return (
                <Card
                  key={index}
                  className="bg-black/60 border-white/10 backdrop-blur-md max-w-5xl mx-auto"
                >
                  <CardContent className="py-3 px-3 sm:px-4">
                    <div className="text-center mb-2">
                      <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
                        Strategy
                      </p>
                      <h3
                        className="text-lg sm:text-xl text-stone-50 tracking-[0.16em] uppercase"
                        style={{ fontFamily: "Bebas Neue, system-ui, sans-serif" }}
                      >
                        Targets
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] tracking-[0.16em] uppercase text-stone-400 text-center md:text-left">
                          Personal
                        </p>

                        {personalTargets.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {personalTargets.map((t, tIdx) => {
                              const actorName = t?.actor?.name;
                              const targetName = t?.target?.name;
                              const actorImage = t?.actor?.image ?? (Array.isArray(t?.images) ? t.images[0] : null);
                              const targetImage = t?.target?.image ?? (Array.isArray(t?.images) ? t.images[1] : null);

                              return (
                                <div
                                  key={`${index}-p-${tIdx}`}
                                  className="rounded-lg border border-rose-400/15 bg-stone-900/55 px-3 py-2"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    {actorImage ? renderMiniAvatar(actorImage, actorName || "Player") : null}
                                    <span className="text-stone-500">→</span>
                                    {targetImage ? renderMiniAvatar(targetImage, targetName || "Target") : null}
                                  </div>

                                  <div className="mt-2">
                                    {t?.legacy ? (
                                      <div
                                        className="text-xs text-stone-300 leading-snug mt-1 text-center"
                                        dangerouslySetInnerHTML={{ __html: t.messageHtml }}
                                      />
                                    ) : (
                                      <div
                                        className="text-sm font-semibold text-stone-400 leading-snug mt-2 text-center"
                                        dangerouslySetInnerHTML={{
                                          __html: highlightNamesHtml(
                                            t?.message || "",
                                            actorName || "",
                                            targetName || ""
                                          ),
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400 text-center md:text-left">
                            No major personal targets surfaced.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] tracking-[0.16em] uppercase text-stone-400 text-center md:text-left">
                          Alliances
                        </p>

                        {allianceTargets.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {allianceTargets.map((a, aIdx) => {
                              const members = a?.alliance?.members || [];
                              const allianceName = getAllianceDisplayName(a?.alliance);
                              const targetName = a?.target?.name;
                              const targetImage = a?.target?.image;
                              const driverName = a?.driver?.name;

                              const attributionText = driverName
                                ? `led by ${driverName}`
                                : "";

                              return (
                                <div
                                  key={`${index}-a-${aIdx}`}
                                  className="rounded-lg border border-blue-400/15 bg-stone-900/45 px-3 py-2"
                                >
                                  {/* alliance members first (main visual focus) */}
                                  <div className="flex flex-wrap justify-center gap-1.5">
                                    {members.map((m) => (
                                      <Avatar
                                        key={m?.name}
                                        className="w-12 h-12 sm:w-14 sm:h-14 border border-white/20 bg-black/30"
                                      >
                                        <AvatarImage
                                          src={m?.image}
                                          alt={m?.name}
                                          className="object-cover"
                                          style={{ imageRendering: "high-quality" }}
                                        />
                                        <AvatarFallback className="bg-stone-700 text-[10px] text-stone-100">
                                          {m?.name?.[0] ?? "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>

                                  <div className="h-px bg-white/5 my-2" />

                                  <div className="mt-2">
                                    <div className="text-sm font-semibold leading-snug text-center">
                                      <span className="text-blue-300">{allianceName}</span>{" "}
                                      <span className="text-stone-400">wants to target</span>{" "}
                                      <span className="text-rose-200">{targetName || "someone"}</span>
                                    </div>
                                    {attributionText && (
                                      <p className="text-xs text-stone-300 leading-snug mt-1 text-center">
                                        {attributionText}
                                      </p>
                                    )}

                                    {targetImage && (
                                      <div className="mt-3 flex items-center justify-center">
                                        <div className="flex flex-col items-center">
                                          <span className="text-[10px] tracking-[0.14em] uppercase text-stone-400">
                                            Target
                                          </span>
                                          <div className="mt-1 rounded-full ring-2 ring-rose-400/30">
                                            {renderMiniAvatar(targetImage, targetName || "Target")}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400 text-center md:text-left">
                            No alliance targeting plans.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // --- Tribe block (camp / tribe status) ---
            if (event.type === "tribe") {
              const swapOccurred = !!event.swapOccurred;
              const tribeTitleClass = getTribeTitleClass(event.currentTribeId);
              const membersForModal = event.membersAfter || event.members;
              const alliancesForModal = event.alliancesAfter || event.alliances;
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
                          <span className={tribeTitleClass}>{event.title}</span> Events
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
                          onClick={() => openRelationshipsModal(membersForModal)}
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
                          onClick={() =>
                            openAlliancesModal(
                              alliancesForModal,
                              membersForModal,
                              { swapOccurred, currentTribeId: event.currentTribeId }
                            )
                          }
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
                        renderMemberAvatar(member, "lg", { swapOccurred })
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // --- Alliance blocks (current alliances / new alliances) ---
            if (event.type === "alliance") {
              const isCurrent = event.title === "Current Alliances";
              const shouldNarrow = !isCurrent;

              return (
                <Card
                  key={index}
                  className={`bg-black/60 border-white/10 backdrop-blur-md${
                    shouldNarrow ? " max-w-4xl mx-auto" : ""
                  }`}
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
                      (event.alliances || [])
                        .filter((a) => (a?.members || []).length >= 2)
                        .map((alliance, i) => (
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
                              {getAllianceDisplayName(alliance)}
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
              // Render advantages right before Tribal Council instead of here.
              if (idolsDisplayMeta.tribalIndex !== -1) return null;
              return (
                <div key={index}>
                  {renderCurrentAdvantagesCard(event, { compact: true })}
                </div>
              );
            }

            // --- Alliance target planning ---
            if (event.type === "allianceTarget") {
              const members = event?.alliance?.members || [];
              const allianceName = getAllianceDisplayName(event?.alliance);
              const targetName = event?.target?.name;
              const driverName = event?.driver?.name;

              return (
                <Card
                  key={index}
                  className="bg-black/60 border-white/10 backdrop-blur-md max-w-5xl mx-auto"
                >
                  <CardContent className="py-3 px-3 sm:px-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex -space-x-2 shrink-0">
                          {members.map((m) => (
                            <Avatar
                              key={m?.name}
                              className="w-10 h-10 sm:w-11 sm:h-11 border border-white/25 bg-black/30"
                            >
                              <AvatarImage
                                src={m?.image}
                                alt={m?.name}
                                className="object-cover"
                                style={{ imageRendering: "high-quality" }}
                              />
                              <AvatarFallback className="bg-stone-700 text-[10px] text-stone-100">
                                {m?.name?.[0] ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm sm:text-base font-semibold text-blue-300 truncate">
                              {allianceName}
                            </span>
                            <span className="text-stone-500">→</span>
                            <span className="text-sm sm:text-base font-semibold text-rose-200 truncate">
                              {targetName || "someone"}
                            </span>
                          </div>
                          <p className="text-xs text-stone-300 leading-snug mt-0.5">
                            Wants to target{driverName ? ` (led by ${driverName})` : ""}.
                          </p>
                        </div>
                      </div>
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
                {event.type === "voting-summary" &&
                  index === idolsDisplayMeta.tribalIndex &&
                  idolsDisplayMeta.idolsEvent && (
                    <div className="-mb-1">
                      {renderCurrentAdvantagesCard(idolsDisplayMeta.idolsEvent, {
                        compact: true,
                      })}
                    </div>
                  )}

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
                    {event.images &&
                    !(event.type === "event" && event.numPlayers === 2) &&
                    !isIdolFindEvent(event) ? (
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

                            const targetEntries = Object.entries(votesByTarget).sort(
                              (a, b) => b[1].voters.length - a[1].voters.length
                            );

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

                                <div className="grid gap-3">
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
                                              {allianceNames.join(", ")}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

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
                    ) : isIdolFindEvent(event) ? (
                      // Idol find event (match Advantages styling)
                      <Card className="bg-black/70 border-white/10 backdrop-blur-md w-full sm:w-4/5 md:w-2/3">
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {event.images?.[0] ? (
                              <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border border-white/30 shadow-md shrink-0 bg-black/40 ring-2 ring-amber-400/20">
                                <AvatarImage
                                  src={event.images[0]}
                                  alt="Advantage finder"
                                  className="object-cover"
                                  style={{ imageRendering: "high-quality" }}
                                />
                                <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
                                  ?
                                </AvatarFallback>
                              </Avatar>
                            ) : null}

                            <div className="flex-1 min-w-0">
                              <div
                                className="rounded-lg bg-amber-500/10 border border-amber-400/20 px-3 py-2 text-xs sm:text-sm font-semibold leading-snug text-center"
                                dangerouslySetInnerHTML={{ __html: event.message }}
                              />
                            </div>
                          </div>
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
        <DialogContent className="bg-stone-950 border-white/10 text-stone-50 max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold tracking-[0.12em] uppercase">
              Current Alliances
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-4">
            {currentAlliances && currentAlliances.filter((a) => (a?.members || []).length >= 2).length > 0 ? (
              (() => {
                const tribeMemberNameSet = new Set(
                  (alliancesModalContext?.tribeMemberNames || []).filter(Boolean)
                );
                const swapOccurred = !!alliancesModalContext?.swapOccurred;

                return currentAlliances
                  .filter((a) => (a?.members || []).length >= 2)
                  .map((alliance, index) => {
                    const allianceKey = getAllianceKey(alliance);
                    const renameOpen = !!renameEditorsOpen?.[allianceKey];

                    return (
                  <div
                    key={index}
                    className="p-4 bg-stone-900/80 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold truncate">
                          {getAllianceDisplayName(alliance)}
                        </h3>
                        <span className="text-[11px] text-stone-300">
                          Strength: {alliance.strength}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] tracking-[0.12em] uppercase border-white/15 bg-white/5 hover:bg-white/10"
                        onClick={() =>
                          setRenameEditorsOpen((prev) => ({
                            ...(prev || {}),
                            [allianceKey]: !prev?.[allianceKey],
                          }))
                        }
                      >
                        {renameOpen ? "Done" : "Rename"}
                      </Button>
                    </div>

                    {renameOpen ? (
                      <div className="mt-2">
                        <Input
                          type="text"
                          value={allianceKey && allianceNameOverrides?.[allianceKey] ? allianceNameOverrides[allianceKey] : ""}
                          onChange={(e) => setAllianceOverrideName(alliance, e.target.value)}
                          placeholder={alliance?.name || "Alliance name"}
                          className="bg-black/40 border border-white/15 text-stone-100"
                        />
                        <p className="mt-1 text-[11px] text-stone-400">
                          Type to rename. Clear to revert.
                        </p>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap justify-center gap-3 mt-1">
                      {(alliance.members || []).map((member) =>
                        renderMemberAvatar(member, "md", {
                          swapOccurred,
                          offTribe:
                            tribeMemberNameSet.size > 0 &&
                            !tribeMemberNameSet.has(member?.name),
                        })
                      )}
                    </div>
                  </div>
                    );
                  });
              })()
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
        <DialogContent className="bg-stone-950 border-white/10 text-stone-50 max-w-3xl lg:max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold tracking-[0.12em] uppercase">
              Tribe Relationships
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto max-h-[70vh] pr-1">
            {selectedTribe && selectedTribe.length > 1 ? (
              (() => {
                const players = [...selectedTribe].sort((a, b) =>
                  (a?.name || "").localeCompare(b?.name || "")
                );

                // Compact columns so the matrix fits in the modal more often.
                // Names remain horizontal; they can wrap within the header cell.
                const gridTemplateColumns = `8.5rem repeat(${players.length}, 3.5rem)`;

                return (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-white/10 bg-black/30">
                      <div
                        className="grid gap-1 p-2"
                        style={{ gridTemplateColumns }}
                      >
                        <div />
                        {players.map((p) => (
                          <div
                            key={`col-${p.name}`}
                            className="px-0.5"
                          >
                            <span
                              className="
                                block text-center
                                text-[9px] sm:text-[10px] text-stone-300 font-semibold
                                leading-[1.1] whitespace-normal break-words
                              "
                            >
                              {p.name}
                            </span>
                          </div>
                        ))}

                        {players.map((row) => (
                          <React.Fragment key={`row-${row.name}`}>
                            <div className="text-xs text-stone-100 font-semibold pr-2 flex items-center justify-end whitespace-nowrap">
                              {row.name}
                            </div>

                            {players.map((col) => {
                              const same = row.name === col.name;
                              const score = same
                                ? null
                                : (row.relationships?.[col.name] ?? 0);
                              const bg = same
                                ? "bg-white/5 text-white border-white/10"
                                : getRelationshipBgClass(score);

                              return (
                                <div
                                  key={`cell-${row.name}-${col.name}`}
                                  className={`
                                    ${bg}
                                    w-14 h-9
                                    rounded-md
                                    border
                                    text-[11px] font-bold
                                    flex items-center justify-center
                                    ${same ? "opacity-60" : ""}
                                  `}
                                >
                                  {same ? "—" : score}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-stone-400 text-center">
                Not enough players to show relationships.
              </p>
            )}
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
