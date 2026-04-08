import { useRef, useState } from "react";
import { DEFAULT_AVATAR_URL, DEFAULT_MALE_AVATAR_URL } from "../../lib/defaultAvatar";

export default function StepAvatar({ value, update, onNext, onBack }) {
  const inputRef = useRef(null);
  const [showDefaultPicker, setShowDefaultPicker] = useState(false);
  const [selectedDefault, setSelectedDefault] = useState(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => update("avatar", e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    setShowDefaultPicker(true);
  };

  const handleSelectDefault = (avatarUrl) => {
    setSelectedDefault(avatarUrl);
  };

  const handleConfirmDefault = () => {
    if (selectedDefault) {
      update("avatar", selectedDefault);
      onNext();
    }
  };

  const handleBackFromPicker = () => {
    setShowDefaultPicker(false);
    setSelectedDefault(null);
  };



  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    update("avatar", null);
    inputRef.current.value = "";
  };

  // Default avatar picker card
  if (showDefaultPicker) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">
            Step 2 of 5
          </p>
          <h2 className="text-2xl font-extrabold text-green-900 mb-1">
            Pick a default avatar
          </h2>
          <p className="text-sm text-gray-500">
            Choose one of our default avatars to get started.
          </p>
        </div>

        {/* Default Avatar Options */}
        <div className="flex-1 flex flex-col items-center justify-center mb-6">
          <div className="flex gap-8">
            {/* Avatar Option 1 */}
            <button
              onClick={() => handleSelectDefault(DEFAULT_AVATAR_URL)}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                selectedDefault === DEFAULT_AVATAR_URL
                  ? "bg-green-100 ring-2 ring-green-500 ring-offset-2"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <img
                src={DEFAULT_AVATAR_URL}
                alt="Default avatar option 1"
                className={`w-28 h-28 rounded-full object-cover border-4 transition-all duration-200 ${
                  selectedDefault === DEFAULT_AVATAR_URL
                    ? "border-green-500 shadow-lg"
                    : "border-gray-200"
                }`}
              />
              {selectedDefault === DEFAULT_AVATAR_URL && (
                <span className="text-xs font-semibold text-green-600">
                  ✓ Selected
                </span>
              )}
            </button>

            {/* Avatar Option 2 */}
            <button
              onClick={() => handleSelectDefault(DEFAULT_MALE_AVATAR_URL)}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                selectedDefault === DEFAULT_MALE_AVATAR_URL
                  ? "bg-green-100 ring-2 ring-green-500 ring-offset-2"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <img
                src={DEFAULT_MALE_AVATAR_URL}
                alt="Default avatar option 2"
                className={`w-28 h-28 rounded-full object-cover border-4 transition-all duration-200 ${
                  selectedDefault === DEFAULT_MALE_AVATAR_URL
                    ? "border-green-500 shadow-lg"
                    : "border-gray-200"
                }`}
              />
              {selectedDefault === DEFAULT_MALE_AVATAR_URL && (
                <span className="text-xs font-semibold text-green-600">
                  ✓ Selected
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-center text-gray-400 mb-4">
          You can always change your avatar later from your profile settings.
        </p>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handleBackFromPicker}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirmDefault}
            disabled={!selectedDefault}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${
              selectedDefault
                ? "bg-green-800 text-white hover:bg-green-900"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-1">
          Step 2 of 5
        </p>
        <h2 className="text-2xl font-extrabold text-green-900 mb-1">
          Put a face to your words
        </h2>
        <p className="text-sm text-gray-500">
          Upload a profile picture — or skip and add one later.
        </p>
      </div>

      {/* Upload Area */}
      <div className="flex-1 flex flex-col items-center justify-center mb-6">

        {value.avatar ? (
          /* — After upload: circular preview — */
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <img
                src={value.avatar}
                alt="Avatar preview"
                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {/* Small re-upload badge */}
              <button
                onClick={() => inputRef.current.click()}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-green-800 text-white flex items-center justify-center shadow-md hover:bg-green-900 transition text-base"
                title="Change photo"
              >
                ✎
              </button>
            </div>

            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="text-xs text-red-400 hover:text-red-600 font-semibold transition"
            >
              ✕ Remove photo
            </button>
          </div>

        ) : (
          /* — Before upload: dashed drop zone — */
          <div
            onClick={() => inputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full max-w-sm flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl py-14 px-8 cursor-pointer bg-white hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center text-3xl transition-colors duration-200">
              📷
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-700 group-hover:text-green-800 transition-colors">
                Click to upload{" "}
                <span className="font-normal text-gray-400">or drag & drop</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG or GIF · Max 5MB
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
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
          onClick={value.avatar ? onNext : handleSkip}
          className="flex-1 py-3 rounded-xl bg-green-800 text-white text-sm font-bold hover:bg-green-900 transition"
        >
          {value.avatar ? "Continue →" : "Skip for now →"}
        </button>
      </div>

    </div>
  );
}