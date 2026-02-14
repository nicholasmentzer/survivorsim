"use client";

import { useEffect, useRef, useState } from "react";

import PlayerConfig from "./PlayerConfig";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ConfigureCast({
  players = [],
  setPlayers = () => {},
  careersData,
  regionsData,
  tribesData,
  hideSliders = false,
  setHideSliders = () => {},
  tribeSize = 10,
  setTribeSize = () => {},
  numTribes = 2,
  setNumTribes = () => {},
  mergeTime = 14,
  setMergeTime = () => {},
  swapEnabled = true,
  setSwapEnabled = () => {},
  swapTime = 18,
  setSwapTime = () => {},
  advantages = { immunityIdol: true },
  setAdvantages = () => {},
  tribeNames = {},
  setTribeNames = () => {},
  randomizeAllStats = () => {},
  customEvents = [],
  eventDescription = "",
  setEventDescription = () => {},
  eventType = "neutral",
  setEventType = () => {},
  eventSeverity = 1,
  setEventSeverity = () => {},
  addCustomEvent = (e) => e?.preventDefault?.(),
  useOnlyCustomEvents = false,
  setUseOnlyCustomEvents = () => {},
  removeCustomEvent = () => {},
}) {
  const [numTribesDraft, setNumTribesDraft] = useState(numTribes);
  const [tribeSizeDraft, setTribeSizeDraft] = useState(tribeSize);
  const [mergeTimeDraft, setMergeTimeDraft] = useState(mergeTime);
  const [swapTimeDraft, setSwapTimeDraft] = useState(swapTime ?? 0);

  useEffect(() => setNumTribesDraft(numTribes), [numTribes]);
  useEffect(() => setTribeSizeDraft(tribeSize), [tribeSize]);
  useEffect(() => setMergeTimeDraft(mergeTime), [mergeTime]);
  useEffect(() => setSwapTimeDraft(Number.isFinite(swapTime) ? swapTime : 0), [swapTime]);

  const totalPlayersDraft = tribeSizeDraft * numTribesDraft;
  const minMergeAtDraft = numTribesDraft <= 1
    ? totalPlayersDraft
    : Math.min(totalPlayersDraft - 1, tribeSizeDraft * (numTribesDraft - 1) + 2);
  const maxMergeAtDraft = numTribesDraft <= 1
    ? totalPlayersDraft
    : Math.max(1, totalPlayersDraft - 1);

  const minSwapSafetyDraft = numTribesDraft <= 1
    ? null
    : Math.min(totalPlayersDraft - 1, tribeSizeDraft * (numTribesDraft - 1) + 2);

  const minMergeAtAfterSwapDraft =
    swapEnabled && numTribesDraft > 1 && Number.isFinite(swapTimeDraft)
      ? (swapTimeDraft - Math.floor(swapTimeDraft / numTribesDraft) + 2)
      : null;

  const effectiveMinMergeAtDraft =
    numTribesDraft <= 1
      ? totalPlayersDraft
      : Math.max(
          2,
          Math.min(
            minMergeAtDraft,
            Number.isFinite(minMergeAtAfterSwapDraft) ? minMergeAtAfterSwapDraft : minMergeAtDraft
          )
        );

  const effectiveMaxMergeAtDraft =
    swapEnabled && Number.isFinite(swapTimeDraft) && numTribesDraft > 1
      ? Math.min(maxMergeAtDraft, swapTimeDraft - 1)
      : maxMergeAtDraft;

  const mergePotentialMin = numTribesDraft <= 1 ? totalPlayersDraft : numTribesDraft * 2;
  const mergePotentialMax = numTribesDraft <= 1 ? totalPlayersDraft : Math.max(1, totalPlayersDraft - 1);

  const minSwapAtDraft = numTribesDraft <= 1
    ? null
    : Math.max(Math.min(totalPlayersDraft - 1, mergeTimeDraft + 1), minSwapSafetyDraft);
  const maxSwapAtDraft = numTribesDraft <= 1 ? null : totalPlayersDraft - 1;
  const hasSwapRange =
    numTribesDraft > 1 &&
    Number.isFinite(minSwapAtDraft) &&
    Number.isFinite(maxSwapAtDraft) &&
    minSwapAtDraft <= maxSwapAtDraft;

  const swapPotentialMin = numTribesDraft <= 1 ? totalPlayersDraft : numTribesDraft * 2;
  const swapPotentialMax = Math.max(1, totalPlayersDraft - 1);

  useEffect(() => {
    // If the merge/tribe settings remove the swap window, disable swap.
    if (!hasSwapRange && swapEnabled) {
      setSwapEnabled(false);
      setSwapTime(null);
    }
    // Keep the draft slider value within bounds as they change.
    if (hasSwapRange) {
      setSwapTimeDraft((prev) => {
        const base = Number.isFinite(swapTime) ? swapTime : prev;
        return Math.max(minSwapAtDraft, Math.min(base, maxSwapAtDraft));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSwapRange, minSwapAtDraft, maxSwapAtDraft, mergeTimeDraft, tribeSizeDraft, numTribesDraft]);

  const tribeKeys = Array.from({ length: numTribes }, (_, i) => `tribe${i + 1}`);
  const getTribeLabel = (tribeKey, fallback) => tribeNames?.[tribeKey] || fallback;

  // --- helpers for inserting Player1 / Player2 tokens ---
  const descriptionRef = useRef(null);

  const insertToken = (token) => {
    const textarea = descriptionRef.current;
    if (!textarea) {
      setEventDescription((prev) =>
        (prev || "").length ? `${prev} ${token}` : token
      );
      return;
    }

    const start = textarea.selectionStart ?? eventDescription.length;
    const end = textarea.selectionEnd ?? eventDescription.length;
    const value = eventDescription || "";

    const before = value.slice(0, start);
    const after = value.slice(end);
    const insertion = token;

    const newValue =
      before + (before && !before.endsWith(" ") ? " " : "") +
      insertion +
      (after && !after.startsWith(" ") ? " " : "") +
      after;

    setEventDescription(newValue);

    // put cursor after inserted token
    requestAnimationFrame(() => {
      const newPos = before.length + insertion.length + 1;
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    });
  };

  const hasPlayer1 = (eventDescription || "").includes("Player1");
  const hasPlayer2 = (eventDescription || "").includes("Player2");
  const hasBothPlayers = hasPlayer1 && hasPlayer2;

  return (
    <div id="configureDiv" className="mt-12 mx-auto max-w-5xl px-4">
      {/* Page heading */}
      <div className="flex flex-col justify-center items-center">
        <h2
          className="
            text-3xl sm:text-4xl text-stone-100
            tracking-[0.24em] uppercase
            mb-1
          "
          style={{ fontFamily: "Bebas Neue, system-ui, sans-serif" }}
        >
          Configure your cast
        </h2>
        <p className="text-[11px] tracking-[0.18em] uppercase text-stone-400">
          Season setup · tribes · custom events
        </p>
      </div>

      <div className="mt-6 space-y-8">
        {/* SEASON SETTINGS */}
        <Card className="bg-black/70 border-white/10">
          <CardHeader className="pb-3 space-y-4">
            <CardTitle
              className="
                text-center text-sm text-stone-200
                tracking-[0.22em] uppercase
              "
            >
              Season Settings
            </CardTitle>

            {/* Tribe count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] uppercase tracking-[0.18em] text-stone-300">
                  Starting tribes
                </Label>
                <span className="text-[11px] text-stone-300">{numTribes}</span>
              </div>
              <Slider
                min={1}
                max={3}
                step={1}
                value={[numTribesDraft]}
                onValueChange={(values) => setNumTribesDraft(values[0])}
                onValueCommit={(values) => setNumTribes(values[0])}
              />
            </div>

            {/* Tribe names */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-stone-300">
                  {numTribesDraft <= 1 ? "Merge tribe name" : "Tribe names"}
                </span>
                <span className="text-[10px] text-stone-400">
                  {numTribesDraft <= 1 ? "Rename your tribe." : "Click a name below to rename the tribe."}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {numTribesDraft > 1
                  ? tribeKeys.map((tribeKey, idx) => (
                      <Input
                        key={tribeKey}
                        type="text"
                        placeholder={`Tribe ${idx + 1} name`}
                        defaultValue={getTribeLabel(tribeKey, `Tribe ${idx + 1}`)}
                        onChange={(e) =>
                          setTribeNames({ ...tribeNames, [tribeKey]: e.target.value })
                        }
                        className="
                          bg-black/40 border border-white/20 text-stone-100
                          rounded-md text-center text-xs md:text-sm
                          py-2
                          font-semibold tracking-[0.08em]
                          focus-visible:ring-1 focus-visible:ring-blue-400
                          focus-visible:border-blue-400
                        "
                      />
                    ))
                  : null}
                <Input
                  type="text"
                  placeholder={numTribesDraft <= 1 ? "Tribe name" : "Merge tribe name"}
                  defaultValue={tribeNames.merge}
                  onChange={(e) =>
                    setTribeNames({ ...tribeNames, merge: e.target.value })
                  }
                  className="
                    bg-black/40 border border-purple-500/70 text-purple-200
                    rounded-md text-center text-xs md:text-sm
                    py-2
                    font-semibold tracking-[0.08em]
                    focus-visible:ring-1 focus-visible:ring-purple-400
                    focus-visible:border-purple-400
                  "
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* tribe size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                  Tribe size
                </Label>
                <span className="text-[11px] text-stone-300">
                  {tribeSizeDraft} ({tribeSizeDraft * numTribesDraft} total players)
                </span>
              </div>
              <Slider
                min={numTribesDraft >= 3 ? 6 : 7}
                max={numTribesDraft <= 1 ? 24 : 15}
                step={1}
                value={[tribeSizeDraft]}
                onValueChange={(values) => setTribeSizeDraft(values[0])}
                onValueCommit={(values) => setTribeSize(values[0])}
              />
            </div>

            {/* merge time */}
            {numTribesDraft > 1 ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                      Merge at player count
                    </Label>
                    <span className="text-[11px] text-stone-300">{mergeTimeDraft}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>
                    </span>
                    <span>
                      Allowed: {effectiveMinMergeAtDraft}–{effectiveMaxMergeAtDraft}
                    </span>
                  </div>
                  <Slider
                    min={mergePotentialMin}
                    max={mergePotentialMax}
                    step={1}
                    value={[mergeTimeDraft]}
                    onValueChange={(values) => {
                      const raw = values[0];
                      const clamped = Math.max(
                        effectiveMinMergeAtDraft,
                        Math.min(raw, effectiveMaxMergeAtDraft)
                      );
                      setMergeTimeDraft(clamped);
                    }}
                    onValueCommit={(values) => {
                      const raw = values[0];
                      const clamped = Math.max(
                        effectiveMinMergeAtDraft,
                        Math.min(raw, effectiveMaxMergeAtDraft)
                      );
                      setMergeTimeDraft(clamped);
                      setMergeTime(clamped);
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                      Tribe swap
                    </Label>
                    <Switch
                      checked={swapEnabled}
                      disabled={!hasSwapRange}
                      onCheckedChange={(checked) => {
                        setSwapEnabled(checked);
                        if (!checked) setSwapTime(null);
                        if (checked && hasSwapRange) {
                          const proposed = Number.isFinite(swapTime)
                            ? swapTime
                            : (Number.isFinite(swapTimeDraft) ? swapTimeDraft : maxSwapAtDraft);
                          const clamped = Math.max(minSwapAtDraft, Math.min(proposed, maxSwapAtDraft));
                          setSwapTimeDraft(clamped);
                          setSwapTime(clamped);
                        }
                      }}
                    />
                  </div>

                  {swapEnabled && hasSwapRange ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                          Swap at player count
                        </Label>
                        <span className="text-[11px] text-stone-300">{swapTimeDraft}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span>
                        </span>
                        <span>
                          Allowed: {minSwapAtDraft}–{maxSwapAtDraft}
                        </span>
                      </div>
                      <Slider
                        min={swapPotentialMin}
                        max={swapPotentialMax}
                        step={1}
                        value={[swapTimeDraft]}
                        onValueChange={(values) => {
                          const raw = values[0];
                          const clamped = Math.max(
                            minSwapAtDraft,
                            Math.min(raw, maxSwapAtDraft)
                          );
                          setSwapTimeDraft(clamped);
                        }}
                        onValueCommit={(values) => {
                          const raw = values[0];
                          const clamped = Math.max(
                            minSwapAtDraft,
                            Math.min(raw, maxSwapAtDraft)
                          );
                          setSwapTimeDraft(clamped);
                          setSwapTime(clamped);
                        }}
                      />
                      <p className="text-[11px] text-stone-400">
                        Swap happens once, before the merge.
                      </p>
                    </>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="text-[11px] text-stone-400">
                Single-tribe season: no swap or merge settings.
              </div>
            )}

            <Separator className="bg-white/10" />

            {/* advantages */}
            <div className="space-y-3">
              <h3 className="text-[11px] tracking-[0.18em] uppercase text-stone-100">
                Advantages
              </h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="immunityIdol"
                  checked={advantages.immunityIdol}
                  onCheckedChange={() =>
                    setAdvantages((prev) => ({
                      ...prev,
                      immunityIdol: !prev.immunityIdol,
                    }))
                  }
                />
                <Label
                  htmlFor="immunityIdol"
                  className="text-xs text-stone-100"
                >
                  Immunity Idol (one per tribe)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PLAYER CONFIG TABS */}
        <Tabs defaultValue="tribe1" className="w-full">
          <Card className="bg-black/60 border-white/10">
            <CardHeader className="pb-0">
              <TabsList
                className="grid bg-black/40 border border-white/10"
                style={{ gridTemplateColumns: `repeat(${numTribes}, minmax(0, 1fr))` }}
              >
                {tribeKeys.map((tribeKey, idx) => (
                  <TabsTrigger
                    key={tribeKey}
                    value={tribeKey}
                    className="text-[11px] sm:text-xs tracking-[0.16em] uppercase"
                  >
                    {numTribes === 1
                      ? (tribeNames?.merge || "Merge")
                      : getTribeLabel(tribeKey, `Tribe ${idx + 1}`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <Label
                    htmlFor="hideSliders"
                    className="text-[11px] tracking-[0.16em] uppercase text-stone-200"
                  >
                    Hide player stats
                  </Label>
                  <Switch
                    id="hideSliders"
                    checked={hideSliders}
                    onCheckedChange={() => setHideSliders((prev) => !prev)}
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="flex flex-col gap-2 items-end w-full">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="text-xs tracking-wide px-3 py-1 h-7 border border-blue-400 bg-blue-900/60 text-blue-100 hover:bg-blue-800/80"
                        variant="outline"
                        onClick={randomizeAllStats}
                      >
                        Randomize Stats
                      </Button>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="text-xs tracking-wide px-3 py-1 h-7 border border-pink-400 bg-pink-900/60 text-pink-100 hover:bg-pink-800/80"
                      variant="outline"
                      onClick={() => {
                        // Remove last names from all players
                        setPlayers((prev) =>
                          (prev || []).map((player) => ({
                            ...player,
                            name: (player.name || '').split(' ')[0],
                          }))
                        );
                      }}
                    >
                      Remove Last Names
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {tribeKeys.map((tribeKey, idx) => (
                <TabsContent key={tribeKey} value={tribeKey}>
                  <PlayerConfig
                    tribeId={idx + 1}
                    players={players}
                    setPlayers={setPlayers}
                    careers={careersData}
                    regions={regionsData}
                    tribes={tribesData}
                    hideSliders={hideSliders}
                    tribeSize={tribeSize}
                  />
                </TabsContent>
              ))}
            </CardContent>
          </Card>
        </Tabs>

        {/* CUSTOM EVENTS */}
        <Card className="bg-black/70 border-white/10">
          <CardHeader className="pb-3 space-y-2">
            <CardTitle className="text-sm tracking-[0.22em] uppercase text-stone-100">
              Custom Events
            </CardTitle>
            <p className="text-xs text-stone-400">
              Create your own moments. Use{" "}
              <span className="font-mono text-stone-200">Player1</span> and{" "}
              <span className="font-mono text-stone-200">Player2</span> tokens
              to affect relationships between two players.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={addCustomEvent} className="space-y-4">
              {/* description + token chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                    Event description
                  </Label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400 mr-1">
                      Tokens:
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="h-6 px-2 text-[10px] font-mono"
                      onClick={() => insertToken("Player1")}
                    >
                      Player1
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="h-6 px-2 text-[10px] font-mono"
                      onClick={() => insertToken("Player2")}
                    >
                      Player2
                    </Button>
                  </div>
                </div>

                <Textarea
                  ref={descriptionRef}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Example: Player1 argued with Player2 at camp."
                  className="bg-stone-900/70 border-stone-700 text-sm text-stone-100"
                  rows={3}
                />

                <p className="text-[10px] text-stone-500">
                  If the text includes both{" "}
                  <span className="font-mono">Player1</span> and{" "}
                  <span className="font-mono">Player2</span>, this event will
                  modify their relationship.
                </p>
              </div>

              <Separator className="bg-white/10" />

              {/* relationship impact */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                    Relationship impact
                  </Label>
                  {!hasBothPlayers && (
                    <span className="text-[10px] text-stone-500">
                      Add both Player tokens to enable this.
                    </span>
                  )}
                </div>

                {hasBothPlayers ? (
                  <>
                    <div className="max-w-xs">
                      <Select
                        value={eventType}
                        onValueChange={setEventType}
                      >
                        <SelectTrigger className="bg-stone-900/70 border-stone-700 text-xs text-stone-100">
                          <SelectValue placeholder="Select impact" />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-stone-700 text-xs">
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {eventType !== "neutral" && (
                      <div className="space-y-1 max-w-xs">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200 mb-2">
                            Impact severity
                          </Label>
                          <span className="text-[11px] text-stone-300">
                            {eventSeverity}
                          </span>
                        </div>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[eventSeverity]}
                          onValueChange={(values) =>
                            setEventSeverity(values[0])
                          }
                        />
                      </div>
                    )}
                  </>
                ) : (
                  // neutral-only view
                  <div className="max-w-xs opacity-60">
                    <Select value="neutral" disabled>
                      <SelectTrigger className="bg-stone-900/70 border-stone-800 text-xs text-stone-400">
                        <SelectValue placeholder="Neutral" />
                      </SelectTrigger>
                    </Select>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" className="text-sm">
                  Add event
                </Button>
              </div>
            </form>

            {/* only custom events toggle */}
            <Separator className="bg-white/10" />

            <div className="flex items-center gap-3">
              <Switch
                id="useOnlyCustomEvents"
                checked={useOnlyCustomEvents}
                onCheckedChange={() =>
                  setUseOnlyCustomEvents((prev) => !prev)
                }
              />
              <Label
                htmlFor="useOnlyCustomEvents"
                className="text-xs text-stone-100"
              >
                Only use custom events (if any entered)
              </Label>
            </div>

            {/* custom events list */}
            <div className="space-y-2 pt-3">
              <h3 className="text-[11px] tracking-[0.18em] uppercase text-stone-200">
                Current custom events
              </h3>

              {customEvents.length === 0 ? (
                <p className="text-xs text-stone-400">
                  No custom events added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {customEvents.map((event, index) => (
                    <div
                      key={index}
                      className="
                        flex items-center justify-between gap-3
                        bg-stone-900/70 border border-white/10
                        px-3 py-2 rounded-lg text-xs text-stone-100
                      "
                    >
                      <div className="flex-1">
                        <span>{event.description}</span>
                        {event.numPlayers === 2 && (
                          <>
                            {" "}
                            –{" "}
                            <span
                              className={
                                event.type === "positive"
                                  ? "text-emerald-300"
                                  : event.type === "negative"
                                  ? "text-rose-300"
                                  : "text-stone-300"
                              }
                            >
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </span>
                            {event.type !== "neutral" && (
                              <span className="text-stone-300">
                                {" "}
                                (severity {event.severity})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 text-[11px] border-stone-500/60"
                        onClick={() => removeCustomEvent(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
