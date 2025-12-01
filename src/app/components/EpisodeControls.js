"use client";

import { Button } from "@/components/ui/button";

export default function EpisodeControls({
  mode,
  startSimulation,
  prevEpisode,
  nextEpisode,
  currentEpisode,
  episodesLength,
  onBackToConfigure,
  variant = "bottom",
}) {
  const isConfigure = mode === "configure";
  const showSideButtons = !isConfigure;

  const containerClasses =
    variant === "top"
      ? "mt-6 mb-4 flex justify-center px-4"
      : "mt-10 mb-16 flex justify-center px-4";

  // Middle button label / action
  const middleLabel = isConfigure ? "Simulate" : "Back to Configure";
  const handleMiddleClick = isConfigure ? startSimulation : onBackToConfigure;

  // Prev is effectively only used outside configure
  const isPrevDisabled = isConfigure;

  // Next label
  let nextLabel = "Next";
  if (mode === "simulate" && episodesLength > 0 && currentEpisode === episodesLength - 1) {
    nextLabel = "View Summary";
  } else if (mode === "summary") {
    nextLabel = "Configure New Season";
  }

  const isNextDisabled =
    isConfigure || (episodesLength === 0 && mode !== "summary");

  return (
    <div className={containerClasses}>
      <div
        className="
          flex flex-col sm:flex-row
          items-stretch sm:items-center
          justify-center
          gap-2 sm:gap-4
          w-full max-w-sm sm:max-w-none
        "
      >
        {/* Previous - hidden on configure, same width as Next on wider screens */}
        {showSideButtons && (
          <Button
            type="button"
            variant="outline"
            disabled={isPrevDisabled}
            onClick={prevEpisode}
            className={`
              h-9
              w-full sm:w-auto sm:min-w-[120px]
              text-[10px] sm:text-xs
              tracking-[0.16em] uppercase
              rounded-full
              border-stone-500/70
              text-stone-200
              bg-stone-900/40
              hover:bg-stone-800/70
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            Previous
          </Button>
        )}

        {/* Middle primary action */}
        <Button
          type="button"
          onClick={handleMiddleClick}
          className="
            h-9
            w-full sm:w-auto
            text-[10px] sm:text-xs
            font-semibold
            tracking-[0.2em] uppercase
            rounded-full
            bg-blue-600/90
            hover:bg-blue-500
            text-white
            shadow-md shadow-blue-900/50
          "
        >
          {middleLabel}
        </Button>

        {/* Next - hidden on configure, same width as Previous on wider screens */}
        {showSideButtons && (
          <Button
            type="button"
            disabled={isNextDisabled}
            onClick={nextEpisode}
            className={`
              h-9
              w-full sm:w-auto sm:min-w-[120px]
              text-[10px] sm:text-xs
              tracking-[0.16em] uppercase
              rounded-full
              bg-emerald-500/90
              hover:bg-emerald-400
              text-slate-950
              shadow-md shadow-emerald-900/40
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
