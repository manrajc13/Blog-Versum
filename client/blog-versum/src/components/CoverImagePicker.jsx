import { useState } from 'react'
import { FALLBACK_COVER_IMAGES } from '../lib/fallbackCoverImages'
import { hexToRgba } from '../store/themeConfig'

export default function CoverImagePicker({ isOpen, onClose, onSelect, theme }) {
  const [selectedImage, setSelectedImage] = useState(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage)
      setSelectedImage(null)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedImage(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[85vh] mx-4 rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col"
        style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b-2 flex items-center justify-between shrink-0"
          style={{ borderColor: hexToRgba(theme.primary, 0.1) }}
        >
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              Pick a Cover Image
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-0.5">
              Choose from our curated collection of writing-themed covers
            </p>
          </div>
          <button
            onClick={handleClose}
            className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-xl text-slate-400">close</span>
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FALLBACK_COVER_IMAGES.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className="relative aspect-video rounded-xl overflow-hidden border-4 transition-all hover:shadow-lg group"
                style={{
                  borderColor: selectedImage === image
                    ? theme.primary
                    : 'transparent',
                  boxShadow: selectedImage === image
                    ? `0 0 0 3px ${hexToRgba(theme.primary, 0.25)}`
                    : undefined,
                }}
              >
                <img
                  src={image}
                  alt={`Cover option ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* Selection indicator */}
                {selectedImage === image && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: hexToRgba(theme.primary, 0.2) }}
                  >
                    <div
                      className="size-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <span className="material-symbols-outlined text-2xl text-white">check</span>
                    </div>
                  </div>
                )}
                {/* Hover overlay */}
                {selectedImage !== image && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t-2 flex items-center justify-between shrink-0"
          style={{
            borderColor: hexToRgba(theme.primary, 0.1),
            backgroundColor: hexToRgba(theme.primary, 0.03),
          }}
        >
          <p className="text-sm font-bold text-slate-400">
            {selectedImage ? 'Image selected' : 'Select an image to continue'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full font-extrabold text-sm border-2 transition-all"
              style={{
                color: hexToRgba(theme.primary, 0.7),
                borderColor: hexToRgba(theme.primary, 0.25),
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedImage}
              className="px-6 py-2.5 rounded-full font-extrabold text-sm text-white transition-all flex items-center gap-2"
              style={{
                backgroundColor: theme.primary,
                boxShadow: selectedImage ? `0 4px 0 ${hexToRgba(theme.primary, 0.4)}` : undefined,
                opacity: selectedImage ? 1 : 0.5,
              }}
            >
              <span className="material-symbols-outlined text-lg">check</span>
              Set as Cover
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
