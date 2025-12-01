// app/components/WelcomeModal.js
export default function WelcomeModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-stone-900 text-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-3">Welcome to Chains - A Survivor Simulator!</h2>
        <p className="text-sm text-left">
          Customize your players, configure settings, and simulate unique Survivor seasons! <br /><br />
        </p>
        <p className="text-base text-left font-bold">
          Reminder: To edit player images and names, just click on the picture or names, and use sliders to adjust stats!! <br /><br />
        </p>
        <p className="text-base mb-4 text-left text-red-200">
          (If you want to add custom events to your simulation, scroll to the bottom of this page!)
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={onClose}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
