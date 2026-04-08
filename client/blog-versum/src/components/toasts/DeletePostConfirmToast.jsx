export function DeletePostConfirmToast({ onCancel, onConfirm, borderColor }) {
  return (
    <div
      className="w-[320px] p-4 rounded-xl shadow-lg border bg-white dark:bg-slate-800"
      style={{ borderColor }}
    >
      <p className="font-bold text-slate-800 dark:text-slate-100 mb-3">
        Delete this post?
      </p>

      <p className="text-sm text-slate-500 mb-4">
        This action cannot be undone.
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
          style={{ backgroundColor: 'rgb(239 68 68)' }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
