// app/components/EpisodeControls.js
export default function EpisodeControls({
  mode,
  startSimulation,
  prevEpisode,
  nextEpisode,
  currentEpisode,
  episodesLength,
  onBackToConfigure,
}) {
  return (
    <div id="interface" className="text-center mt-8 mb-20">
      {mode === "configure" ? (
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold"
          onClick={startSimulation}
        >
          SIMULATE
        </button>
      ) : (
        <div className="text-center p-4 text-white">
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={prevEpisode}
              className={`px-4 py-2 rounded ${
                currentEpisode === 0 ? "bg-stone-600" : "bg-blue-500"
              }`}
            >
              Previous
            </button>

            <button
              className="bg-stone-500 text-white px-6 py-3 rounded-lg font-bold"
              onClick={onBackToConfigure}
            >
              BACK TO CONFIGURE
            </button>

            <button
              onClick={nextEpisode}
              className={`px-4 py-2 rounded ${
                currentEpisode === episodesLength - 1
                  ? "bg-stone-600"
                  : "bg-green-500"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
