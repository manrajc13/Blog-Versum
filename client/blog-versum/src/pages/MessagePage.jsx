import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import PageDoodles from '../components/shared/PageDoodles'
import MessageSidebar from '../components/messages/MessageSidebar'
import ChatContainer from '../components/messages/ChatContainer'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { useMessageStore } from '../store/useMessageStore'
import { useAuthStore } from '../store/useAuthStore'

export default function MessagePage({ authUser }) {
  const theme = useThemeStore((state) => state.getTheme())
  const { setActiveUser, fetchMessages, subscribeToMessages, unsubscribeFromMessages } = useMessageStore()
  const activeUser = useMessageStore((state) => state.activeUser)
  const socket = useAuthStore((state) => state.socket)
  const [showChatOnMobile, setShowChatOnMobile] = useState(false)

  useEffect(() => {
    // Subscribing is a no-op if the socket hasn't connected yet, so this must
    // re-run once `socket` actually becomes available (e.g. a hard refresh
    // on this route can render before useAuthStore finishes connecting).
    if (!socket) return
    subscribeToMessages()
    return () => unsubscribeFromMessages()
  }, [socket, subscribeToMessages, unsubscribeFromMessages])

  const handleSelectUser = (user) => {
    setActiveUser(user)
    fetchMessages(user._id)
    setShowChatOnMobile(true)
  }

  return (
    <div className="text-slate-900 dark:text-slate-100 h-screen relative flex flex-col overflow-hidden" style={{ backgroundColor: theme.homeBackground }}>
      <PageDoodles variant="sparse" />

      <div className="relative z-10 flex flex-col h-full">
        <Navbar
          iconColor={theme.primary}
          activeLink="Messages"
          navLinks={[
            { label: 'Home', to: '/home' },
            { label: 'My Journal', to: '/journal' },
            { label: 'Settings', to: '/settings' },
            { label: 'Explore', to: '/explore' },
          ]}
          avatarUrl={authUser?.avatar}
        />

        <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 md:px-10 py-6 md:py-8 min-h-0">
          <div
            className="h-full rounded-xl border-4 bg-white dark:bg-slate-900 shadow-xl overflow-hidden flex"
            style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
          >
            {/* Sidebar */}
            <div
              className={`w-full md:w-[340px] shrink-0 h-full border-r-2 ${showChatOnMobile ? 'hidden md:block' : 'block'}`}
              style={{ borderColor: hexToRgba(theme.primary, 0.14) }}
            >
              <MessageSidebar activeUser={activeUser} onSelectUser={handleSelectUser} />
            </div>

            {/* Chat */}
            <div className={`flex-1 min-w-0 h-full flex flex-col ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
              {showChatOnMobile && (
                <button
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold shrink-0"
                  style={{ color: theme.primary }}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
              )}
              <div className="flex-1 min-h-0">
                <ChatContainer key={activeUser?._id || 'none'} activeUser={activeUser} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
