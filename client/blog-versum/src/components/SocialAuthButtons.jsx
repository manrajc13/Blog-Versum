export default function SocialAuthButtons() {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        className="w-full max-w-xs flex items-center justify-center h-12 gap-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-slate-700 dark:text-slate-300"
      >
        <span className="material-symbols-outlined">google</span>
        {/* <span>Google</span> */}
      </button>
    </div>
  )
}
