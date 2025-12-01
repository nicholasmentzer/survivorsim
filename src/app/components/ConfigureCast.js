// app/components/ConfigureCast.js
import PlayerConfig from "./PlayerConfig";

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
  return (
    <div id="configureDiv" className="mt-12 mx-auto max-w-5xl">
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-xl text-stone-200 font-bold mb-2">
          Configure your cast
        </h2>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        {/* Left Column */}
        <div className="flex flex-col items-center justify-center">
          <input
            type="text"
            placeholder={"Tribe 1 Name"}
            onChange={(e) =>
              setTribeNames({ ...tribeNames, tribe1: e.target.value })
            }
            className="w-auto bg-transparent text-xl font-bold text-blue-400 text-center border-b-2 border-blue-400 focus:outline-none"
          />
          <div className="h-5" />
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
        </div>

        {/* Middle Column */}
        <div className="flex flex-col items-center justify-start">
          <input
            type="text"
            placeholder={"Merge Tribe Name"}
            onChange={(e) =>
              setTribeNames({ ...tribeNames, merge: e.target.value })
            }
            className="w-auto bg-transparent text-xl font-bold text-purple-400 text-center border-b-2 border-purple-400 focus:outline-none"
          />

          <div className="h-4" />

          <button
            className="bg-stone-800 text-white px-2 py-1 mb-3 rounded-lg font-bold text-sm mt-4 hover:bg-stone-900 transition"
            onClick={randomizeAllStats}
          >
            Randomize Stats
          </button>

          <div className=" flex items-center mb-6">
            <input
              type="checkbox"
              id="hideSliders"
              checked={hideSliders}
              onChange={() => setHideSliders((prev) => !prev)}
              className="mr-2 w-4 h-4"
            />
            <label htmlFor="hideSliders" className="text-white text-sm">
              Hide Stats
            </label>
          </div>

          <div className="flex flex-col items-center">
            <h2 className="font-bold text-white mb-2">Select Tribe Size</h2>

            <input
              type="range"
              min="7"
              max="15"
              value={tribeSize}
              onChange={(e) => setTribeSize(Number(e.target.value))}
              className="w-3/4 sm:w-full h-1 sm:h-2 mb-2 sm:mb-0 bg-stone-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <p className="text-white">{`Tribe Size: ${tribeSize} (${tribeSize * 2} Total Players)`}</p>
          </div>

          <div className="h-4" />
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-white mb-1">{`Merge At: ${mergeTime}`}</h2>

            <input
              type="range"
              min={tribeSize + 1}
              max={tribeSize * 2}
              value={mergeTime}
              onChange={(e) => setMergeTime(Number(e.target.value))}
              className="w-3/4 sm:w-full h-1 sm:h-2 mb-2 sm:mb-0 bg-stone-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          <div className="h-6" />
          <h3 className="text-white font-bold mb-2">Select Advantages</h3>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={advantages.immunityIdol}
                onChange={() =>
                  setAdvantages((prev) => ({
                    ...prev,
                    immunityIdol: !prev.immunityIdol,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-white">
                Immunity Idol (one per tribe)
              </span>
            </label>
            {/* Future checkboxes can be added here */}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center">
          <input
            type="text"
            placeholder={"Tribe 2 Name"}
            onChange={(e) =>
              setTribeNames({ ...tribeNames, tribe2: e.target.value })
            }
            className="w-auto bg-transparent text-xl font-bold text-red-400 text-center border-b-2 border-red-400 focus:outline-none"
          />
          <div className="h-5" />
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
        </div>
      </div>

      <div className="h-5" />

      {/* Custom Events */}
      <h2 className="text-xl font-bold mt-8">Add Custom Events</h2>
      <form onSubmit={addCustomEvent} className="bg-stone-800 p-4 rounded-lg">
        <label className="text-gray-300 text-sm">Description</label>
        <input
          type="text"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          placeholder="Use Player1 and Player2 as placeholders (max 2 players) Example: Player1 argued with Player2."
          className="w-full p-2 rounded border border-gray-600 bg-stone-800 text-white focus:outline-none focus:border-blue-400 text-xs sm:text-base"
        />

        <div className="h-2" />

        {eventDescription.includes("Player1") &&
        eventDescription.includes("Player2") ? (
          <>
            <label className="text-gray-300 text-sm">
              Relationship Impact (only used if event has 2 players)
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full p-2 rounded border border-gray-700 bg-stone-800 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
            {eventType !== "neutral" && (
              <>
                <div className="h-2" />
                <label className="text-gray-300 text-sm">
                  Impact Severity (only used if event has 2 players)
                </label>
                <input
                  type="number"
                  value={eventSeverity}
                  onChange={(e) =>
                    setEventSeverity(Number(e.target.value))
                  }
                  min="1"
                  max="5"
                  className="w-full p-2 rounded border border-gray-700 bg-stone-800 text-white focus:outline-none focus:border-blue-400"
                />
              </>
            )}
          </>
        ) : (
          <>
            <label className="text-gray-500 text-sm">
              Relationship Impact (only available if event has 2 players)
            </label>
            <select
              disabled
              className="w-full p-2 rounded border border-gray-700 bg-stone-900 text-gray-500 cursor-not-allowed"
            >
              <option value="neutral">Neutral</option>
            </select>
          </>
        )}
        <div className="h-2" />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Add Event
        </button>
      </form>

      {/* Only custom events */}
      <div className=" flex items-center mt-6">
        <input
          type="checkbox"
          id="useOnlyCustomEvents"
          checked={useOnlyCustomEvents}
          onChange={() => setUseOnlyCustomEvents((prev) => !prev)}
          className="mr-2 w-4 h-4"
        />
        <label htmlFor="useOnlyCustomEvents" className="text-white text-sm">
          Only use custom events (if any entered)
        </label>
      </div>

      <h3 className="text-lg font-bold mt-4">Custom Events</h3>
      {customEvents.length === 0 ? (
        <p className="text-gray-400">No custom events added yet.</p>
      ) : (
        <ul className="text-white space-y-1">
          <div className="mt-4 space-y-2">
            {customEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-stone-800 text-white px-4 py-2 rounded-lg shadow-md"
              >
                <span>
                  {event.description} -{" "}
                  <span
                    className={
                      event.type === "positive"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {event.type.charAt(0).toUpperCase() +
                      event.type.slice(1)}
                  </span>{" "}
                  ({event.severity})
                </span>
                <button
                  className="ml-4 bg-white px-2 py-1 rounded-full text-sm hover:bg-red-300"
                  onClick={() => removeCustomEvent(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </ul>
      )}

      <div className="h-10" />

      {/* Custom Alliance Names */}
      <h2 className="text-xl font-bold mt-8">Add Custom Alliance Name</h2>
      <form
        onSubmit={addCustomAllianceName}
        className="bg-stone-800 p-4 rounded-lg"
      >
        <input
          type="text"
          value={customAllianceDescription}
          onChange={(e) => setCustomAllianceDescription(e.target.value)}
          placeholder="Custom Alliance name"
          className="w-full p-2 rounded border border-gray-600 bg-stone-800 text-white focus:outline-none focus:border-blue-400 text-xs sm:text-base"
        />

        <div className="h-2" />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Add Alliance Name
        </button>
      </form>

      <label className="flex items-center space-x-2 mt-6">
        <input
          type="checkbox"
          checked={useNumberedAlliances}
          onChange={() => setuseNumberedAlliances(!useNumberedAlliances)}
          className="w-4 h-4"
        />
        <span className="text-white">
          Use basic numbered alliance names (rather than custom or random
          names)
        </span>
      </label>

      <h3 className="text-lg font-bold mt-4">Custom Alliance Names</h3>
      {customAllianceNames.length === 0 ? (
        <p className="text-gray-400">No custom alliance names added yet.</p>
      ) : (
        <ul className="text-white space-y-1">
          <div className="mt-4 space-y-2">
            {customAllianceNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-stone-800 text-white px-4 py-2 rounded-lg shadow-md"
              >
                <span>{name}</span>
                <button
                  className="ml-4 bg-white px-2 py-1 rounded-full text-sm hover:bg-red-300"
                  onClick={() => removeCustomName(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </ul>
      )}
    </div>
  );
}
