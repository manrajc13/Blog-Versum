import { useState } from "react";

const ALL_TAGS = [
  "Coding", "Technology", "Philosophy", "History", "Economics", "Art",
  "Poetry", "Fiction", "Gaming", "Sports", "Science", "Music", "Travel",
  "Food", "Photography", "Film", "Politics", "Psychology", "Design",
  "Architecture", "Literature", "Mathematics", "Environment", "Health",
  "Fashion", "Business", "Language", "Astronomy", "Yoga", "Culture",
  "Mythology", "True Crime", "Self Improvement", "Startups", "Anime",
  "Comics", "Spirituality", "Minimalism", "Cyberpunk", "Theatre",
];

export default function StepInterests({ value, update, onNext, onBack, isFirst }) {
  const [search, setSearch] = useState("");

  const selected = value.interests; // string[]

  const filtered = ALL_TAGS.filter((tag) =>
    tag.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTag = (tag) => {
    if (selected.includes(tag)) {
      update("interests", selected.filter((t) => t !== tag));
    } else {
      update("interests", [...selected, tag]);
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">
          Step 1 of 5
        </p>
        <h2 className="text-2xl font-extrabold text-green-900 mb-1">
          What fires you up?
        </h2>
        <p className="text-sm text-gray-500">
          Pick topics you love — your feed will be tailored around them.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search interests..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex-1 overflow-y-auto pr-1 mb-4">
        {filtered.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filtered.map((tag) => {
              const isSelected = selected.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150
                    ${
                      isSelected
                        ? "border-green-700 text-green-800 bg-green-50 shadow-sm"
                        : "border-gray-200 text-gray-600 bg-white hover:border-green-400 hover:text-green-700"
                    }`}
                >
                  {isSelected && (
                    <span className="text-green-700 text-xs">✓</span>
                  )}
                  {tag}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <span className="text-3xl mb-2">🔎</span>
            <p className="text-sm">No interests found for "{search}"</p>
          </div>
        )}
      </div>

      {/* Selected count hint */}
      <p className="text-xs text-gray-400 mb-4">
        {selected.length === 0
          ? "Nothing selected yet — pick as many as you like."
          : `${selected.length} interest${selected.length > 1 ? "s" : ""} selected`}
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirst && (
          <button
            onClick={onBack}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition"
          >
            ← Back
          </button>
        )}
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