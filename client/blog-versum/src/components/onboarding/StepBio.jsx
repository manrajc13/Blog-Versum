const MAX_CHARS = 160;

export default function StepBio({ value, update, onNext, onBack }) {
  const remaining = MAX_CHARS - value.bio.length;
  const isNearLimit = remaining <= 20;
  const isAtLimit = remaining === 0;

  const handleChange = (e) => {
    if (e.target.value.length > MAX_CHARS) return;
    update("bio", e.target.value);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">
          Step 3 of 5
        </p>
        <h2 className="text-2xl font-extrabold text-green-900 mb-1">
          Your writing soul
        </h2>
        <p className="text-sm text-gray-500">
          A little something about you — or skip and let your stories speak.
        </p>
      </div>

      {/* Textarea */}
      <div className="flex-1 flex flex-col mb-4">
        <div className="relative flex-1">
          <textarea
            value={value.bio}
            onChange={handleChange}
            placeholder="Ink-stained dreamer writing at 2am with cold coffee and big ideas..."
            className="w-full h-full min-h-40 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition leading-relaxed"
          />

          {/* Character counter — inside textarea bottom right */}
          <span
            className={`absolute bottom-3 right-4 text-xs font-semibold transition-colors
              ${isAtLimit
                ? "text-red-400"
                : isNearLimit
                ? "text-amber-400"
                : "text-gray-300"
              }`}
          >
            {remaining}
          </span>
        </div>

        {/* Subtle hint below */}
        <p className="text-xs text-gray-400 mt-2 ml-1">
          {isAtLimit
            ? "You've reached the limit — keep it punchy!"
            : isNearLimit
            ? "Almost at the limit!"
            : "160 characters max · Make it yours."}
        </p>
      </div>

      {/* Optional hint */}
      <p className="text-xs text-center text-gray-400 mb-4">
        This is optional — you can always update it from your profile settings.
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
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
          {value.bio.trim() ? "Continue →" : "Skip for now →"}
        </button>
      </div>

    </div>
  );
}