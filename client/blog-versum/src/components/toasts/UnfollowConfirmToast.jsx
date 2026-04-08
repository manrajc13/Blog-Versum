export function UnfollowConfirmToast({ onCancel, onConfirm, borderColor, primaryColor, clickPosition }) {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900
  const toastWidth = 340
  const offset = 12

  const targetLeft = clickPosition?.x ?? (viewportWidth / 2)
  const targetTop = clickPosition?.y ?? (viewportHeight / 2)

  const left = Math.max(12, Math.min(targetLeft + offset, viewportWidth - toastWidth - 12))
  const top = Math.max(12, Math.min(targetTop + offset, viewportHeight - 220))

  return (
    <div
      className="w-[340px] p-4 rounded-xl shadow-lg border bg-white dark:bg-slate-800"
      style={{
        borderColor,
        position: 'fixed',
        left,
        top,
        margin: 0,
        zIndex: 9999,
      }}
    >
      <p className="font-bold text-slate-800 dark:text-slate-100 mb-2">
        Unfollow this profile?
      </p>

      <p className="text-sm text-slate-500 mb-4">
        They will no longer appear in your followers-only feed.
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="px-3 py-1.5 rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Unfollow
        </button>
      </div>
    </div>
  )
}
