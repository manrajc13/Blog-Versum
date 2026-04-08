import plainImg from "../../assets/plain.png";
import sunshineImg from "../../assets/sunshine.png";
import midnightImg from "../../assets/midnight.png";
import oceanImg from "../../assets/ocean.png";
import cottonImg from "../../assets/cotton.png";
import forestImg from "../../assets/forest.png";

const THEMES = [
  {
    id: "plain",
    name: "Plain",
    description: "Minimal & Neutral",
    img: plainImg,
    glow: "shadow-gray-300",
    border: "border-gray-400",
    badge: "bg-gray-800 text-white",
  },
  {
    id: "sunshine",
    name: "Sunshine",
    description: "Bright & Happy",
    img: sunshineImg,
    glow: "shadow-amber-300",
    border: "border-amber-400",
    badge: "bg-amber-500 text-white",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Cozy & Dark",
    img: midnightImg,
    glow: "shadow-indigo-400",
    border: "border-indigo-400",
    badge: "bg-indigo-500 text-white",
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    description: "Calm & Bubbly",
    img: oceanImg,
    glow: "shadow-cyan-300",
    border: "border-cyan-400",
    badge: "bg-cyan-500 text-white",
  },
  {
    id: "cotton",
    name: "Cotton Candy",
    description: "Sweet & Soft",
    img: cottonImg,
    glow: "shadow-pink-300",
    border: "border-pink-400",
    badge: "bg-pink-500 text-white",
  },
  {
    id: "forest",
    name: "Forest Adventure",
    description: "Fresh & Leafy",
    img: forestImg,
    glow: "shadow-emerald-300",
    border: "border-emerald-400",
    badge: "bg-emerald-600 text-white",
  },
];

export default function StepTheme({ value, update, onNext, onBack, isLast, isSubmitting }) {
  const selected = THEMES.find((t) => t.id === value.themePreference) ?? THEMES[0];

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">
          Step 5 of 5
        </p>
        <h2 className="text-2xl font-extrabold text-green-900 mb-1">
          Dress your universe
        </h2>
        <p className="text-sm text-gray-500">
          Choose a theme that feels like home — you can switch anytime.
        </p>
      </div>

      {/* Large selected preview */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border-2 shadow-lg mb-5 transition-all duration-300
          ${selected.border} ${selected.glow}`}
        style={{ height: 180 }}
      >
        <img
          src={selected.img}
          alt={selected.name}
          className="w-full h-full object-cover object-top"
        />

        {/* Overlay label */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
          <div>
            <p className="text-white text-base font-extrabold leading-tight">
              {selected.name}
            </p>
            <p className="text-white/70 text-xs font-medium">
              {selected.description}
            </p>
          </div>

          {/* Checkmark badge */}
          <div
            className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${selected.badge}`}
          >
            ✓
          </div>
        </div>
      </div>

      {/* Small theme picker cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {THEMES.map((theme) => {
          const isSelected = theme.id === value.themePreference;
          return (
            <button
              key={theme.id}
              onClick={() => update("themePreference", theme.id)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 group
                ${
                  isSelected
                    ? `${theme.border} ${theme.glow} shadow-md scale-[1.03]`
                    : "border-gray-200 hover:border-gray-300 hover:scale-[1.02]"
                }`}
            >
              {/* Screenshot */}
              <div className="h-16 overflow-hidden">
                <img
                  src={theme.img}
                  alt={theme.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Name */}
              <div className="bg-white px-2 py-1.5">
                <p className="text-xs font-bold text-gray-700 truncate">
                  {theme.name}
                </p>
              </div>

              {/* Checkmark badge on selected */}
              {isSelected && (
                <div
                  className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow ${theme.badge}`}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition"
        >
          ← Back
        </button>
        {/* Continue button inside StepTheme gets replaced by this in Onboarding */}
        <button
        onClick={onNext}
        disabled={isSubmitting}
        className="flex-1 py-3 rounded-xl bg-green-800 text-white text-sm font-bold hover:bg-green-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
        {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Setting up your space...
            </span>
        ) : "🎉 Start Writing!"}
        </button>
    </div>

    </div>
  );
}