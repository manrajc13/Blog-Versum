import { useState } from 'react'
import { hexToRgba } from '../../store/themeConfig'
import ConnectionsCard from './ConnectionsCard'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'

function StatPill({ iconColor, label, value, onClick, clickable = false }) {
  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className="flex-1 text-left rounded-xl border-2 px-3 py-2 transition-all"
      style={{
        borderColor: hexToRgba(iconColor, 0.2),
        backgroundColor: hexToRgba(iconColor, 0.06),
        cursor: clickable ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (!clickable) return
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.backgroundColor = hexToRgba(iconColor, 0.11)
      }}
      onMouseLeave={(e) => {
        if (!clickable) return
        e.currentTarget.style.transform = 'translateY(0px)'
        e.currentTarget.style.backgroundColor = hexToRgba(iconColor, 0.06)
      }}
    >
      <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">{label}</p>
      <p className="text-base font-extrabold" style={{ color: iconColor }}>{value}</p>
    </button>
  )
}

export default function ProfilePopoverCard({ iconColor, profile, onLogout, onViewProfile }) {
  const [openListType, setOpenListType] = useState(null)

  const listTitle = openListType === 'followers' ? 'Your Followers' : 'Following'

  const handleViewProfile = (target) => {
    setOpenListType(null)
    onViewProfile?.(target)
  }

  return (
    <div className="relative animate-[fadeIn_200ms_ease-out]">
      <div
        className="absolute right-0 top-[calc(100%+12px)] w-[340px] rounded-3xl border-4 overflow-hidden z-50 shadow-2xl"
        style={{
          backgroundColor: 'white',
          borderColor: hexToRgba(iconColor, 0.23),
          boxShadow: `0 18px 50px ${hexToRgba(iconColor, 0.2)}`,
        }}
      >
        <div
          className="px-5 py-4 border-b-2 relative overflow-hidden"
          style={{
            borderBottomColor: hexToRgba(iconColor, 0.14),
            background: `linear-gradient(135deg, ${hexToRgba(iconColor, 0.12)} 0%, ${hexToRgba(iconColor, 0.03)} 100%)`,
          }}
        >
          <div className="absolute -right-4 -top-5 opacity-20 pointer-events-none rotate-12">
            <span className="material-symbols-outlined text-7xl" style={{ color: iconColor }}>auto_stories</span>
          </div>

          <div className="flex items-start gap-3 relative z-10">
            <div
              className="size-14 rounded-full overflow-hidden border-4 shrink-0"
              style={{ borderColor: hexToRgba(iconColor, 0.3) }}
            >
              <img src={profile.avatar || DEFAULT_AVATAR_URL} alt={profile.username} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black bouncy-text text-slate-800 truncate">{profile.username}</p>
              <p className="text-xs font-bold text-slate-500 truncate">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <StatPill iconColor={iconColor} label="Blogs" value={profile.numberofBlogs ?? 0} />
            <StatPill
              iconColor={iconColor}
              label="Followers"
              value={profile.followerCount ?? 0}
              clickable
              onClick={() => setOpenListType('followers')}
            />
            <StatPill
              iconColor={iconColor}
              label="Following"
              value={profile.followingCount ?? 0}
              clickable
              onClick={() => setOpenListType('following')}
            />
          </div>

          <button
            onClick={onLogout}
            className="w-full rounded-full px-4 py-2.5 text-sm font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.99]"
            style={{
              color: '#fff',
              backgroundColor: iconColor,
              boxShadow: `0 6px 0 ${hexToRgba(iconColor, 0.8)}`,
            }}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Logout
          </button>
        </div>
      </div>

      {openListType && (
        <ConnectionsCard
          iconColor={iconColor}
          title={listTitle}
          listType={openListType}
          onClose={() => setOpenListType(null)}
          onViewProfile={handleViewProfile}
        />
      )}
    </div>
  )
}
