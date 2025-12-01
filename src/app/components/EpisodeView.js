// app/components/EpisodeView.js
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
  return (
    <div className="text-center p-4 text-white min-h-screen w-full">
      {/* Top nav buttons */}
      <div className="flex justify-center items-center space-x-4 mb-6">
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
            currentEpisode === episodes.length - 1 ? "bg-stone-600" : "bg-green-500"
          }`}
        >
          Next
        </button>
      </div>

      <h2 className="text-2xl font-bold mt-4">Episode {currentEpisode + 1}</h2>

      <div className="mt-8 space-y-8 w-full">
        {episodes[currentEpisode]?.map((event, index) => {
          if (event.type === "tribe") {
            return (
              <div key={index} className="w-full">
                <div className="mb-2 border-t-4 border-gray-400"></div>
                <div className="relative mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full mx-auto">
                  <button
                    className="absolute top-2 left-2 bg-stone-800 text-stone-400 text-xs px-2 py-1 rounded hover:bg-stone-700 transition"
                    onClick={() => openRelationshipsModal(event.members)}
                  >
                    View Relationships
                  </button>

                  <button
                    className="absolute top-10 left-2 bg-stone-800 text-stone-400 text-xs px-2 py-1 rounded hover:bg-stone-700 transition"
                    onClick={() => openAlliancesModal(event.alliances)}
                  >
                    View Alliances
                  </button>

                  <div className="mt-16 sm:mt-0">
                    <span className="text-xl font-bold uppercase tracking-wide">
                      {event.title} Events
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-2 w-full">
                    {event.members?.map((member) => (
                      <div key={member.name} className="flex flex-col items-center text-center w-20">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-10 h-10 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 flex-shrink-0 aspect-square"
                          style={{
                            minWidth: "64px",
                            minHeight: "64px",
                            imageRendering: "high-quality",
                          }}
                        />
                        <p className="text-white text-xs mt-1">{member.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {alliancesModalOpen && (
                  <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
                    onClick={closeAlliancesModal}
                  >
                    <div
                      className="bg-stone-900 text-white p-6 rounded-lg shadow-lg w-[80%] max-w-2xl relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-lg font-bold mb-4 text-center">Current Alliances</h2>

                      {currentAlliances && currentAlliances.length > 0 ? (
                        <div className="overflow-auto max-h-[60vh] space-y-4">
                          {currentAlliances.map((alliance, index) => (
                            <div
                              key={index}
                              className="p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-md"
                            >
                              <h3 className="text-lg font-bold">{alliance.name}</h3>
                              <p className="text-sm text-gray-300">
                                Strength: {alliance.strength}
                              </p>

                              <div className="grid grid-cols-5 gap-3 mt-2">
                                {alliance.members.map((member) => (
                                  <div key={member.name} className="text-center">
                                    <img
                                      src={member.image}
                                      alt={member.name}
                                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-gray-600 mx-auto"
                                    />
                                    <p className="text-white text-xs mt-1">{member.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 mt-4">
                          No alliances found for this tribe.
                        </p>
                      )}

                      <button
                        className="mt-6 bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg w-full"
                        onClick={closeAlliancesModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {showRelationshipsModal && selectedTribe && (
                  <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
                    onClick={closeRelationshipsModal}
                  >
                    <div
                      className="bg-stone-900 text-white p-6 rounded-lg shadow-lg w-[80%] max-w-2xl relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-lg font-bold mb-4 text-center">
                        Tribe Relationships
                      </h2>

                      <div className="overflow-auto max-h-[60vh] space-y-4">
                        {selectedTribe.map((player) => {
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
                              className="bg-stone-800 p-4 rounded-lg shadow-md"
                            >
                              <div className="flex justify-between items-center">
                                <h3 className="text-md font-bold text-white">
                                  {player.name}
                                </h3>

                                <div className="relative">
                                  <button
                                    onClick={() => toggleFilterMode(player.name)}
                                    className="bg-stone-700 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1"
                                  >
                                    <span>
                                      {filterMode === "none"
                                        ? "Show Important"
                                        : filterMode === "all"
                                        ? "Hide All"
                                        : "Show All"}
                                    </span>

                                    {filterMode === "none" ? (
                                      <span className="text-green-400">+</span>
                                    ) : filterMode === "all" ? (
                                      <span className="text-red-400">-</span>
                                    ) : (
                                      <span className="text-green-400">+</span>
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="mt-2 space-y-1">
                                {displayedRelationships.length > 0 ? (
                                  displayedRelationships.map(({ name, score }) => {
                                    const bgColor =
                                      score === 5
                                        ? "bg-green-400"
                                        : score === 4
                                        ? "bg-green-500"
                                        : score === 3
                                        ? "bg-green-700"
                                        : score === 2
                                        ? "bg-green-800"
                                        : score === 1
                                        ? "bg-green-900"
                                        : score === 0
                                        ? "bg-gray-500 bg-opacity-50"
                                        : score === -5
                                        ? "bg-red-800"
                                        : score === -4
                                        ? "bg-red-700"
                                        : score === -3
                                        ? "bg-red-500"
                                        : score === -2
                                        ? "bg-red-400"
                                        : "bg-red-300";

                                    return (
                                      <div
                                        key={name}
                                        className={`flex justify-between px-3 py-2 rounded ${bgColor} bg-opacity-50`}
                                      >
                                        <span className="text-white text-sm">{name}</span>
                                        <span className="text-white font-bold">
                                          {score}
                                        </span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        className="mt-6 bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg w-full"
                        onClick={closeRelationshipsModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (event.type === "alliance") {
            return (
              <div key={index} className="mt-8">
                {event.title === "Current Alliances" && (
                  <div className="mb-6 border-t-4 border-gray-400"></div>
                )}
                <div className="flex items-center justify-center">
                  <h3 className="text-xl font-bold text-white ml-6">{event.title}</h3>

                  {event.title === "Current Alliances" && (
                    <button
                      onClick={() =>
                        setShowCurrentAlliances((prev) => !prev)
                      }
                      className="p-2 rounded-lg hover:bg-stone-700 transition"
                    >
                      {showCurrentAlliances ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-blue-400"
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
                          className="w-6 h-6 text-blue-400"
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
                    </button>
                  )}
                </div>

                {event.title === "Current Alliances" ? (
                  <div className={`${showCurrentAlliances ? "block" : "hidden"}`}>
                    {event.alliances.map((alliance, i) => (
                      <div
                        key={i}
                        className="mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full max-w-3xl mx-auto"
                      >
                        <h4 className="text-lg font-bold text-white">
                          {alliance.name}
                        </h4>
                        <div className="text-white">{`Strength: ${alliance.strength}`}</div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                          {alliance.members.map((member) => (
                            <div key={member.name} className="text-center">
                              <img
                                src={member.image}
                                className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 mx-auto"
                                style={{ imageRendering: "high-quality" }}
                              />
                              <p className="text-white text-xs sm:text-sm mt-1">
                                {member.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  event.alliances.map((alliance, i) => (
                    <div
                      key={i}
                      className="mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full max-w-3xl mx-auto"
                    >
                      <h4 className="text-lg font-bold text-white">
                        {alliance.name}
                      </h4>
                      <div className="text-white">{`Strength: ${alliance.strength}`}</div>
                      <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {alliance.members.map((member) => (
                          <div key={member.name} className="text-center">
                            <img
                              src={member.image}
                              className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 mx-auto"
                              style={{ imageRendering: "high-quality" }}
                            />
                            <p className="text-white text-xs sm:text-sm mt-1">
                              {member.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          } else if (event.type === "idols") {
            return (
              <div key={index} className="pb-6">
                <div className="flex items-center justify-center">
                  <h3 className="text-xl font-bold text-white ml-6">
                    Current Advantages
                  </h3>

                  <button
                    onClick={() => setShowAdvantages((prev) => !prev)}
                    className="p-2 rounded-lg hover:bg-stone-700 transition"
                  >
                    {showAdvantages ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-blue-400"
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
                        className="w-6 h-6 text-blue-400"
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
                  </button>
                </div>

                {showAdvantages && event.idols && (
                  <div className="rounded-lg">
                    <div className="space-y-2 mt-2">
                      {Object.entries(event.idols).map(([tribe, player]) =>
                        player ? (
                          <div key={tribe} className="text-white">
                            <span className="font-bold text-blue-400">
                              {player.name}
                            </span>{" "}
                            has an immunity idol
                          </div>
                        ) : (
                          <div key={tribe} className="text-gray-400"></div>
                        )
                      )}
                      {!Object.values(event.idols).some((idol) => idol) && (
                        <p className="text-gray-400 text-center mt-2">
                          No idols currently in play.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (event.type === "allianceTarget") {
            return (
              <div
                key={index}
                className="mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full max-w-3xl mx-auto"
              >
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {event.alliance.members.map((member) => (
                    <div key={member.name} className="text-center">
                      <img
                        src={member.image}
                        className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 mx-auto"
                        style={{ imageRendering: "high-quality" }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  className={` text-white px-6 pt-6 rounded-lg text-center text-xs sm:text-base font-semibold ${
                    event.images ? "" : "py-4 px-8"
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: event.message }} />
                </div>
              </div>
            );
          } else if (event.type === "immunity") {
            return (
              <div key={index}>
                <span className="text-xl font-bold uppercase tracking-wide">
                  Immunity Challenge
                </span>
                <div className="mb-2 border-t-4 border-gray-400"></div>
                <div className="mt-4 pb-6">
                  <div
                    className={`bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-base font-semibold ${
                      event.images ? "" : "py-4 px-8"
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: event.message }} />
                  </div>
                  <div className="w-full">
                    <div className="mt-3 p-4 bg-stone-800 bg-opacity-40 rounded-lg shadow-lg w-full mx-auto">
                      <div className="flex flex-wrap justify-center gap-3 mt-2 w-full">
                        {event.members?.map((member) => (
                          <div
                            key={member.name}
                            className="flex flex-col items-center text-center w-20"
                          >
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-gray-600 flex-shrink-0 aspect-square"
                              style={{
                                minWidth: "64px",
                                minHeight: "64px",
                                imageRendering: "high-quality",
                              }}
                            />
                            <p className="text-white text-xs mt-1">
                              {member.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={index}>
                {event.type === "voting-summary" ? (
                  <div className="mt-10">
                    <span className="text-xl font-bold uppercase tracking-wide">
                      Tribal Council
                    </span>
                    <div className="mb-6 border-t-4 border-gray-400"></div>
                  </div>
                ) : (
                  <></>
                )}
                {event.type === "relationship" ? (
                  <div className="mt-10">
                    <span className="text-xl font-bold uppercase tracking-wide">
                      Relationship Highlights/Targets
                    </span>
                    <div className="mb-6 border-t-4 border-gray-400"></div>
                  </div>
                ) : (
                  <></>
                )}
                {event.type !== "relationship" ? (
                  <div className="flex flex-col items-center space-y-2">
                    {event.images ? (
                      <div className="flex space-x-4">
                        {event.images.map((image, i) => (
                          <img
                            key={i}
                            src={image}
                            alt="Event image"
                            className="w-12 h-12 sm:w-24 sm:h-24 object-cover rounded-full mb-2"
                            style={{ imageRendering: "high-quality" }}
                          />
                        ))}
                      </div>
                    ) : null}

                    {event.type === "voting-summary" ? (
                      <div className="bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-sm w-4/5 sm:w-4/5 md:w-1/3">
                        {event.message.map((vote, i) => (
                          <div
                            key={i}
                            className="text-xs sm:text-sm font-semibold py-4"
                            dangerouslySetInnerHTML={{ __html: vote }}
                          ></div>
                        ))}
                      </div>
                    ) : event.type === "voting" ? (
                      <div className="bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center w-full sm:w-4/5 md:w-1/3">
                        {event.message.map((vote, i) => {
                          if (!vote.includes("voted for")) {
                            return (
                              <div
                                key={i}
                                className="text-xs sm:text-sm mb-1"
                                dangerouslySetInnerHTML={{ __html: vote }}
                              ></div>
                            );
                          } else {
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
                                className="grid grid-cols-3 gap-2 px-4 py-1"
                              >
                                <span className="text-sm font-semibold text-blue-300 text-left">
                                  {voter}
                                </span>
                                <span className="text-sm text-gray-400 text-center">
                                  →
                                </span>
                                <span className="text-sm font-semibold text-red-300 text-right">
                                  {target}
                                </span>
                                {allianceText && (
                                  <span className="text-xs text-gray-400 italic">
                                    {allianceText}
                                  </span>
                                )}
                              </div>
                            );
                          }
                        })}
                      </div>
                    ) : event.type === "event" && event.numPlayers === 2 ? (
                      <div
                        className={`bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-xs sm:text-base font-semibold ${
                          event.images ? "" : "py-4 px-8"
                        }`}
                      >
                        {event.message.map((element, index) => (
                          <div key={index}>
                            <div
                              dangerouslySetInnerHTML={{ __html: element }}
                            />
                            <div className="h-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`bg-stone-800 text-white px-6 py-3 rounded-lg shadow-md text-center text-xs sm:text-base font-semibold ${
                          event.images ? "" : "py-4 px-8"
                        }`}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: event.message }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
