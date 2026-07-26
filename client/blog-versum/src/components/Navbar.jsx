import { useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { hexToRgba } from '../store/themeConfig'
import SearchBar from "./SearchBar";
import BrandLogo from './shared/BrandLogo'
import ProfilePopoverCard from './profile/ProfilePopoverCard'
import { useAuthStore } from '../store/useAuthStore'
import { DEFAULT_AVATAR_URL } from '../lib/defaultAvatar'
import { useProfileStore } from '../store/useProfileStore'

const defaultNavLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Explore', to: '/explore' },
  { label: 'My Journal', to: '/journal' },
]

export default function Navbar({
  navLinks = defaultNavLinks,
  iconColor = '#8c2bee',
  activeLink = null,
  notification_active = false,
  onNotificationClick,
  profileInfo,
  avatarUrl = DEFAULT_AVATAR_URL,
}) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { fetchMyProfileBasics, isFetchingMyBasics } = useProfileStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const [popoverProfile, setPopoverProfile] = useState(null)
  const profileContainerRef = useRef(null)

  const profileData = {
    username: popoverProfile?.username || profileInfo?.username || 'guest',
    email: popoverProfile?.email || profileInfo?.email || 'guest@blogverse.app',
    avatar: popoverProfile?.avatar || profileInfo?.avatar || avatarUrl || DEFAULT_AVATAR_URL,
    followerCount: popoverProfile?.followerCount ?? profileInfo?.followerCount ?? 0,
    followingCount: popoverProfile?.followingCount ?? profileInfo?.followingCount ?? 0,
    numberofBlogs: popoverProfile?.numberofBlogs ?? profileInfo?.numberofBlogs ?? 0,
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    setProfileOpen(false)
    navigate('/login')
  }

  const handleViewProfile = (target) => {
    const identifier = typeof target === 'string' ? target : target?.identifier
    const userType = typeof target === 'string' ? 'human' : (target?.userType || 'human')
    if (!identifier) return
    setProfileOpen(false)
    navigate(`/profile/${encodeURIComponent(identifier)}${userType === 'AI' ? '?userType=AI' : ''}`)
  }

  const handleHomeNavigation = () => {
    // Hard navigate so Home always fully refreshes.
    navigate('/home')
  }

  const handleNavLinkClick = (link) => {
    if (!link?.to || link.to === '#') return
    if (link.to === '/home') {
      handleHomeNavigation()
      return
    }
    navigate(link.to)
  }

  const handleAvatarClick = async () => {
    if (profileOpen) {
      setProfileOpen(false)
      return
    }

    try {
      const response = await fetchMyProfileBasics()
      const basics = response?.message
      if (basics && typeof basics === 'object') {
        setPopoverProfile(basics)
      }
    } catch {
      // If fetch fails, we still open with best available local fallback props.
    }

    setProfileOpen(true)
  }

  return (
    <header
      className="flex items-center justify-between border-b-2 border-dashed bg-white dark:bg-background-dark px-6 md:px-16 py-2.5 sticky top-0 z-50"
      style={{ borderBottomColor: hexToRgba(iconColor, 0.22) }}
    >
      <div className="flex items-center gap-6">
        {/* Logo */}
        <BrandLogo color={iconColor} onClick={handleHomeNavigation} />

        <SearchBar iconColor={iconColor} />
      </div>

      <div className="flex items-center gap-5">
        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavLinkClick(link)}
              className="text-sm font-bold transition-colors"
              style={{
                color: activeLink === link.label ? iconColor : '#334155',
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Messages */}
          <button
            className="relative p-2 rounded-full hover:scale-110 transition-transform"
            style={{ backgroundColor: hexToRgba(iconColor, 0.14) }}
            onClick={() => navigate('/messages')}
            title="Messages"
          >
            <span className="material-symbols-outlined" style={{ color: iconColor }}>chat_bubble</span>
          </button>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-full hover:scale-110 transition-transform"
            style={{ backgroundColor: hexToRgba(iconColor, 0.14) }}
            onClick={onNotificationClick}
          >
            <span className="material-symbols-outlined" style={{ color: iconColor }}>notifications</span>
            {notification_active && (
              <div className="absolute -top-1 -right-1 bg-accent-orange w-3 h-3 rounded-full border-2 border-white"></div>
            )}
          </button>

          {/* User Avatar + Profile popover */}
          <div className="relative" ref={profileContainerRef}>
            <button
              className="size-10 rounded-full border-2 overflow-hidden shadow-sm hover:scale-105 transition-transform"
              style={{ borderColor: iconColor }}
              onClick={handleAvatarClick}
              disabled={isFetchingMyBasics}
            >
              <img
                className="w-full h-full object-cover"
                src={profileData.avatar}
                alt="User avatar"
              />
            </button>

            {profileOpen && (
              <ProfilePopoverCard
                iconColor={iconColor}
                profile={profileData}
                onLogout={handleLogout}
                onViewProfile={handleViewProfile}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
