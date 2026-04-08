import { hexToRgba } from '../../store/themeConfig'
import { useEffect, useMemo, useState } from 'react'
import { useFollowStore } from '../../store/useFollowStore'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'

function ConnectionRow({ person, iconColor, onViewProfile }) {
  const isAIAuthor = person.userType === 'AI'

  return (
    <button
      onClick={() => onViewProfile?.({ identifier: person.identifier || person.username, userType: person.userType || 'human' })}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all hover:scale-[1.01]"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hexToRgba(iconColor, 0.08)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <div
        className="size-9 rounded-full overflow-hidden border-2 shrink-0 flex items-center justify-center text-white text-xs font-black"
        style={{
          borderColor: hexToRgba(iconColor, 0.28),
          backgroundColor: 'transparent',
        }}
      >
        <img src={person.avatar || DEFAULT_AVATAR_URL} alt={person.username} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-700 dark:text-slate-100 truncate">{person.username}</p>
        <p className="text-[11px] text-slate-400 font-bold">{isAIAuthor ? 'AI Author' : `@${person.username?.toLowerCase()}`}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="text-[10px] font-black px-2 py-1 rounded-full"
          style={{
            color: iconColor,
            backgroundColor: hexToRgba(iconColor, 0.1),
          }}
        >
          View
        </span>
        {isAIAuthor && (
          <span className="material-symbols-outlined text-[15px]" style={{ color: iconColor }}>smart_toy</span>
        )}
      </div>
    </button>
  )
}

export default function ConnectionsCard({
  iconColor,
  title,
  listType,
  onClose,
  onViewProfile,
}) {
  const { gettingFollowingorFollowed, fetchFollowing, fetchFollowers } = useFollowStore()
  const [list, setList] = useState([])
  const [isBootLoading, setIsBootLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      setIsBootLoading(true)
      setList([])

      try {
        const payload = listType === 'followers'
          ? await fetchFollowers()
          : await fetchFollowing()

        const source = listType === 'followers'
          ? (payload?.followers || [])
          : (payload?.following || [])

        if (!mounted) return

        setList(
          source.map((person) => ({
            id: person._id || person.id,
            username: person.username,
            avatar: person.avatar,
            userType: person.userType || 'human',
            identifier: person.username,
          }))
        )
      } catch {
        if (mounted) setList([])
      } finally {
        if (mounted) setIsBootLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [listType, fetchFollowers, fetchFollowing])

  const emptyLabel = useMemo(
    () => (listType === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'),
    [listType]
  )

  const showLoading = isBootLoading || gettingFollowingorFollowed

  return (
    <div
      className="absolute right-[calc(100%+10px)] top-0 w-[300px] rounded-2xl border-4 overflow-hidden z-[60] bg-white dark:bg-slate-900 shadow-2xl"
      style={{
        borderColor: hexToRgba(iconColor, 0.22),
        boxShadow: `0 16px 42px ${hexToRgba(iconColor, 0.2)}`,
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between border-b-2"
        style={{
          borderBottomColor: hexToRgba(iconColor, 0.14),
          backgroundColor: hexToRgba(iconColor, 0.06),
        }}
      >
        <h4 className="text-sm font-extrabold bouncy-text" style={{ color: iconColor }}>
          {title}
        </h4>
        <button
          onClick={onClose}
          className="size-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: hexToRgba(iconColor, 0.12), color: iconColor }}
        >
          <span className="material-symbols-outlined text-[15px]">close</span>
        </button>
      </div>

      <div className="relative max-h-72 overflow-y-auto p-2">
        {showLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]" style={{ backgroundColor: hexToRgba(iconColor, 0.08) }}>
            <span className="material-symbols-outlined animate-spin text-2xl" style={{ color: iconColor }}>
              progress_activity
            </span>
          </div>
        )}

        {!showLoading && list.length === 0 && (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-3xl" style={{ color: hexToRgba(iconColor, 0.35) }}>group_off</span>
            <p className="mt-2 text-xs font-bold text-slate-400">{emptyLabel}</p>
          </div>
        )}

        {list.map((person) => (
          <ConnectionRow key={person.id} person={person} iconColor={iconColor} onViewProfile={onViewProfile} />
        ))}
      </div>
    </div>
  )
}
