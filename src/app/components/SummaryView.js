// app/components/SummaryView.js
export default function SummaryView({ finalPlacements }) {
  return (
    <div className="bg-stone-800 text-white p-6 rounded-lg shadow-lg w-full mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Final Placements</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {finalPlacements
          .sort((a, b) => a.placement - b.placement)
          .map((player) => (
            <div key={player.name} className="bg-stone-700 p-3 rounded-lg flex items-center space-x-4">
              <img
                src={player.image || "/default-player.png"}
                alt={player.name}
                className="w-12 h-12 object-cover rounded-full border-2 border-gray-600"
              />
              <div>
                <p className="text-lg">{player.name}</p>
                <p className="text-gray-400">
                  {player.placement === 1 ? "Winner" : `#${player.placement}`}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
