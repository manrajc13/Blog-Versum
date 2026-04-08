import { useState } from "react";

export default function StepPrivacy({ value, update, onNext, onBack, isLast }) {
  const [animating, setAnimating] = useState(false);

  const handleToggle = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    update("isPrivate", !value.isPrivate);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">
          Step 4 of 5
        </p>
        <h2 className="text-2xl font-extrabold text-green-900 mb-1">
          Who can read your stories?
        </h2>
        <p className="text-sm text-gray-500">
          You can always change this later from your settings.
        </p>
      </div>

      {/* Toggle Card */}
      <div className="flex-1 flex flex-col justify-center gap-6">

        {/* Animated Icon */}
        <div className="flex justify-center">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl transition-all duration-300
              ${value.isPrivate ? "bg-green-900" : "bg-green-100"}
              ${animating ? "scale-90" : "scale-100"}
            `}
          >
            <span
              className={`transition-all duration-300 ${animating ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
            >
              {value.isPrivate ? "🔒" : "🌍"}
            </span>
          </div>
        </div>

        {/* State label */}
        <div className="text-center">
          <h3
            className={`text-lg font-extrabold transition-colors duration-300 ${
              value.isPrivate ? "text-green-900" : "text-green-700"
            }`}
          >
            {value.isPrivate ? "Private Account" : "Public Account"}
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {value.isPrivate
              ? "Only people you approve can follow you and read your stories."
              : "Anyone can discover, follow, and read your stories on BlogVerse."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span
            className={`text-sm font-semibold transition-colors duration-200 ${
              !value.isPrivate ? "text-green-800" : "text-gray-400"
            }`}
          >
            Public
          </span>

          <button
            onClick={handleToggle}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/30
              ${value.isPrivate ? "bg-green-800" : "bg-gray-200"}`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300
                ${value.isPrivate ? "translate-x-7" : "translate-x-0"}`}
            />
          </button>

          <span
            className={`text-sm font-semibold transition-colors duration-200 ${
              value.isPrivate ? "text-green-800" : "text-gray-400"
            }`}
          >
            Private
          </span>
        </div>

        {/* Info pill */}
        <div
          className={`mx-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-center max-w-xs transition-colors duration-300
            ${value.isPrivate
              ? "bg-green-900/10 text-green-900"
              : "bg-gray-100 text-gray-500"
            }`}
        >
          {value.isPrivate
            ? "🔐 Your stories won't appear in public search or explore feeds."
            : "✨ Your stories can be discovered by readers across BlogVerse."}
        </div>

      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl bg-green-800 text-white text-sm font-bold hover:bg-green-900 transition"
        >
          Continue →
        </button>
      </div>

    </div>
  );
}