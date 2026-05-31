"use client";
import React, { useState, useEffect } from "react";
import playersData from "../data/players.json";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

const PlayerConfig = ({
  tribeId,
  players,
  setPlayers,
  careers,
  regions,
  tribeData,
  hideSliders,
  tribeSize,
}) => {
  const [playerData, setPlayerData] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageValid, setImageValid] = useState(true);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const tribePlayers = (players || []).filter((p) => p.tribeId === tribeId);
    setPlayerData(tribePlayers.slice(0, tribeSize));
  }, [players, tribeSize, tribeId]);

  const presetPlayers = [...playersData.men, ...playersData.women];

  const assignPresetCharacter = (playerIndex, selectedName) => {
    const selectedPreset = presetPlayers.find(
      (preset) => preset.name === selectedName
    );

    if (selectedPreset) {
      const updatedPlayers = playerData.map((player, index) =>
        index === playerIndex
          ? {
              ...player,
              name: selectedPreset.name,
              image: selectedPreset.image,
            }
          : player
      );

      setPlayerData(updatedPlayers);
      setPlayers((prev) => {
        const updatedById = new Map(updatedPlayers.map((p) => [p.id, p]));
        return (prev || []).map((p) =>
          p.tribeId === tribeId && updatedById.has(p.id) ? updatedById.get(p.id) : p
        );
      });
    }
  };

  const updatePlayerProperty = (playerIndex, prop, value) => {
    const updatedPlayers = playerData.map((player, index) =>
      index === playerIndex ? { ...player, [prop]: value } : player
    );

    setPlayerData(updatedPlayers);
    setPlayers((prev) => {
      const updatedById = new Map(updatedPlayers.map((p) => [p.id, p]));
      return (prev || []).map((p) =>
        p.tribeId === tribeId && updatedById.has(p.id) ? updatedById.get(p.id) : p
      );
    });
  };

  const openImageModal = (playerIndex) => {
    setSelectedPlayer(playerIndex);
    setImageUrl(playerData[playerIndex].image || "");
    setImageValid(true);
    setImageModalOpen(true);
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
      setImageModalOpen(false);
    }
  };

  // Downscale + compress an uploaded image to a small data URL.
  // Avatars render at ~96px, so we cap the longest edge well above that for
  // retina headroom — turning multi-MB photos into tiny strings. This keeps
  // decode (per episode navigation) and storage tiny.
  // Format per source: PNG uploads stay PNG (preserves transparency); everything
  // else exports JPEG (far smaller for photographs).
  const MAX_IMAGE_DIM = 256;
  const resizeImageFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          try {
            const out = file.type === "image/png"
              ? canvas.toDataURL("image/png")
              : canvas.toDataURL("image/jpeg", 0.85);
            resolve(out);
          } catch {
            // Tainted canvas or unsupported type — fall back to the original.
            resolve(reader.result);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10000000) {
        alert("File is too large! Please upload an image under 10MB.");
        return;
      }
      try {
        const resized = await resizeImageFile(file);
        setImageUrl(resized);
        setImageValid(true);
      } catch {
        alert("Could not process that image. Please try a different file.");
      }
    }
  };

  const renderSlider = (player, playerIndex, label, num) => {
    const labels = [
      "Challenge (Pre-Merge)",
      "Challenge (Post-Merge)",
      "Likeability",
      "Threat",
      "Strategy",
    ];

    return (
      <div className="space-y-1.5" key={`${label}-${num}-${playerIndex}`}>
        <div className="flex items-baseline justify-between gap-2">
          <Label className="text-xs sm:text-[13px] text-stone-300 font-medium">
            {labels[num]}
          </Label>
          <span className="text-sm font-semibold text-stone-100 tabular-nums">
            {player[label]}
          </span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[player[label]]}
          onValueChange={(values) =>
            updatePlayerProperty(playerIndex, label, values[0])
          }
          trackClassName="h-1.5 bg-stone-700"
          rangeClassName="bg-stone-400"
          thumbClassName="h-4 w-4 bg-stone-200 border-stone-500"
        />
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
        className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      >
        {playerData.map((player, index) => (
          <Card
            key={player.id}
            className="bg-stone-900/85 border-stone-800 text-slate-50 flex flex-col min-w-[260px]"
          >
            <CardHeader className="pb-3">
              {/* Avatar + (Presets above name input) */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="relative shrink-0"
                  onClick={() => openImageModal(index)}
                >
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 border border-white/30 shadow-md">
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
                  <div className="absolute bottom-0 right-0 mb-1 mr-1 rounded-full bg-black/80 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-slate-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </div>
                </button>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="xs"
                      className="
                        h-5 px-2
                        text-[9px] tracking-[0.16em] uppercase
                        border-white/20 bg-white/5 hover:bg-white/10
                      "
                      type="button"
                      onClick={() => {
                        setSelectedPlayerIndex(index);
                        setPresetModalOpen(true);
                      }}
                    >
                      Presets
                    </Button>
                  </div>
                  <Input
                    value={player.name}
                    onChange={(e) =>
                      updatePlayerProperty(index, "name", e.target.value)
                    }
                    className="
                      bg-transparent border-0 border-b border-white/30 rounded-none px-0
                      text-sm sm:text-base text-white
                      font-semibold tracking-[0.06em]
                      focus-visible:ring-0 focus-visible:ring-offset-0
                      focus-visible:border-white
                    "
                  />
                </div>
              </div>
            </CardHeader>

            {!hideSliders && (
              <CardContent className="space-y-4 pt-0 pb-5">
                {renderSlider(player, index, "premerge", 0)}
                {renderSlider(player, index, "postmerge", 1)}
                {renderSlider(player, index, "likeability", 2)}
                {renderSlider(player, index, "threat", 3)}
                {renderSlider(player, index, "strategicness", 4)}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* IMAGE DIALOG */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="bg-stone-900 border border-stone-700 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Update Player Image
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                validateImage(e.target.value);
              }}
              placeholder="Enter image URL"
              className="bg-stone-800 border-stone-700 text-xs"
            />

            <div className="text-center text-[11px] text-muted-foreground">
              OR upload a file (max 2MB)
            </div>

            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="bg-stone-800 border-stone-700 text-xs cursor-pointer"
            />

            <div className="flex justify-center py-2">
              {imageValid && imageUrl ? (
                <Avatar className="w-24 h-24 border border-gray-500">
                  <AvatarImage
                    src={imageUrl}
                    alt="Preview"
                    className="object-cover"
                    style={{ imageRendering: "high-quality" }}
                  />
                  <AvatarFallback className="bg-stone-700 text-xs text-stone-100">
                    ?
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-24 h-24 flex items-center justify-center text-red-500 border-2 border-red-500 rounded-full text-xs">
                  {imageUrl ? "Invalid Image" : "No Image"}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setImageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full"
              disabled={!imageValid || !imageUrl}
              onClick={saveImage}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRESET DIALOG (unchanged) */}
      <Dialog open={presetModalOpen} onOpenChange={setPresetModalOpen}>
        <DialogContent className="bg-stone-900 border border-stone-700 text-slate-50 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Select a Preset Character
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-2 mt-2">
            {Object.keys(categorizedPlayers)
              .sort()
              .map((show) => (
                <div key={show} className="mb-4">
                  <button
                    type="button"
                    onClick={() => toggleCategory(show)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-slate-200 py-2"
                  >
                    <span>{show}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform ${
                        expandedCategories[show] ? "rotate-180" : ""
                      }`}
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

                  <Separator className="bg-white/10" />

                  {expandedCategories[show] && (
                    <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-3">
                      {categorizedPlayers[show]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              assignPresetCharacter(
                                selectedPlayerIndex,
                                preset.name
                              );
                              setPresetModalOpen(false);
                            }}
                            className="relative flex items-end justify-center aspect-square rounded-lg overflow-hidden bg-stone-800 text-[11px] font-semibold group"
                          >
                            <img
                              src={preset.image}
                              onError={(e) =>
                                (e.target.style.display = "none")
                              }
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                              alt={preset.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <span className="relative z-10 px-1 text-center">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setPresetModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerConfig;
