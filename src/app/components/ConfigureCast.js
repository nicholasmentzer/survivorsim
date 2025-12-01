"use client";

import { useRef } from "react";

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
  playerConfig,
  updatePlayers,
  careersData,
  regionsData,
  tribesData,
  hideSliders,
  setHideSliders,
  tribeSize,
  setTribeSize,
  mergeTime,
  setMergeTime,
  advantages,
  setAdvantages,
  tribeNames,
  setTribeNames,
  randomizeAllStats,
  customEvents,
  eventDescription,
  setEventDescription,
  eventType,
  setEventType,
  eventSeverity,
  setEventSeverity,
  addCustomEvent,
  useOnlyCustomEvents,
  setUseOnlyCustomEvents,
  removeCustomEvent,
  customAllianceDescription,
  setCustomAllianceDescription,
  addCustomAllianceName,
  customAllianceNames,
  removeCustomName,
  useNumberedAlliances,
  setuseNumberedAlliances,
}) {
  const tribe1Label = tribeNames.tribe1 || "Tribe 1";
  const tribe2Label = tribeNames.tribe2 || "Tribe 2";

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

  const hasPlayer1 = eventDescription.includes("Player1");
  const hasPlayer2 = eventDescription.includes("Player2");
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

            {/* Tribe names */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-stone-300">
                  Tribe names
                </span>
                <span className="text-[10px] text-stone-400">
                  Click a name below to rename the tribe.
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  type="text"
                  placeholder="Tribe 1 name"
                  defaultValue={tribeNames.tribe1}
                  onChange={(e) =>
                    setTribeNames({ ...tribeNames, tribe1: e.target.value })
                  }
                  className="
                    bg-black/40 border border-blue-500/70 text-blue-200
                    rounded-md text-center text-xs md:text-sm
                    py-2
                    font-semibold tracking-[0.08em]
                    focus-visible:ring-1 focus-visible:ring-blue-400
                    focus-visible:border-blue-400
                  "
                />
                <Input
                  type="text"
                  placeholder="Merge tribe name"
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
                <Input
                  type="text"
                  placeholder="Tribe 2 name"
                  defaultValue={tribeNames.tribe2}
                  onChange={(e) =>
                    setTribeNames({ ...tribeNames, tribe2: e.target.value })
                  }
                  className="
                    bg-black/40 border border-red-500/70 text-red-200
                    rounded-md text-center text-xs md:text-sm
                    py-2
                    font-semibold tracking-[0.08em]
                    focus-visible:ring-1 focus-visible:ring-red-400
                    focus-visible:border-red-400
                  "
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* randomize */}
            <div className="flex items-center justify-between">
              <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                Randomize all stats
              </Label>
              <Button
                type="button"
                size="sm"
                className="text-xs tracking-wide"
                onClick={randomizeAllStats}
              >
                Randomize
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {/* hide stats */}
            <div className="flex items-center justify-between">
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

            <Separator className="bg-white/10" />

            {/* tribe size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                  Tribe size
                </Label>
                <span className="text-[11px] text-stone-300">
                  {tribeSize} ({tribeSize * 2} total players)
                </span>
              </div>
              <Slider
                min={7}
                max={15}
                step={1}
                value={[tribeSize]}
                onValueChange={(values) => setTribeSize(values[0])}
              />
            </div>

            {/* merge time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                  Merge at player count
                </Label>
                <span className="text-[11px] text-stone-300">{mergeTime}</span>
              </div>
              <Slider
                min={tribeSize + 1}
                max={tribeSize * 2}
                step={1}
                value={[mergeTime]}
                onValueChange={(values) => setMergeTime(values[0])}
              />
            </div>

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
              <TabsList className="grid grid-cols-2 bg-black/40 border border-white/10">
                <TabsTrigger
                  value="tribe1"
                  className="text-[11px] sm:text-xs tracking-[0.16em] uppercase"
                >
                  {tribe1Label}
                </TabsTrigger>
                <TabsTrigger
                  value="tribe2"
                  className="text-[11px] sm:text-xs tracking-[0.16em] uppercase"
                >
                  {tribe2Label}
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-4">
              <TabsContent value="tribe1">
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
              </TabsContent>

              <TabsContent value="tribe2">
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
              </TabsContent>
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

        {/* CUSTOM ALLIANCE NAMES (mostly your original logic, slightly styled) */}
        <Card className="bg-black/70 border-white/10 mb-8">
          <CardHeader className="pb-3 space-y-2">
            <CardTitle className="text-sm tracking-[0.22em] uppercase text-stone-100">
              Custom Alliance Names
            </CardTitle>
            <p className="text-xs text-stone-400">
              Add fun, thematic names that alliances can randomly use during the
              season.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form
              onSubmit={addCustomAllianceName}
              className="bg-stone-900/70 p-3 rounded-lg space-y-2 border border-stone-700/80"
            >
              <Label className="text-[11px] tracking-[0.16em] uppercase text-stone-200">
                Add alliance name
              </Label>
              <Input
                type="text"
                value={customAllianceDescription}
                onChange={(e) =>
                  setCustomAllianceDescription(e.target.value)
                }
                placeholder="Example: The Coconut Alliance"
                className="bg-stone-950/80 border-stone-700 text-sm text-stone-100"
              />

              <div className="pt-1">
                <Button type="submit" className="text-sm">
                  Add alliance name
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-3">
              <Switch
                id="useNumberedAlliances"
                checked={useNumberedAlliances}
                onCheckedChange={() =>
                  setuseNumberedAlliances(!useNumberedAlliances)
                }
              />
              <Label
                htmlFor="useNumberedAlliances"
                className="text-xs text-stone-100"
              >
                Use basic numbered alliance names (instead of custom/random
                names)
              </Label>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-[11px] tracking-[0.18em] uppercase text-stone-200">
                Current custom alliance names
              </h3>

              {customAllianceNames.length === 0 ? (
                <p className="text-xs text-stone-400">
                  No custom alliance names added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {customAllianceNames.map((name, index) => (
                    <div
                      key={index}
                      className="
                        flex items-center justify-between gap-3
                        bg-stone-900/70 border border-white/10
                        px-3 py-2 rounded-lg text-xs text-stone-100
                      "
                    >
                      <span>{name}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 text-[11px] border-stone-500/60"
                        onClick={() => removeCustomName(index)}
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
