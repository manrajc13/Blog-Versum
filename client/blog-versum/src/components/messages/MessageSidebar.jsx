import { useEffect, useMemo, useState } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'
import { useMessageStore } from '../../store/useMessageStore'
import { useAuthStore } from '../../store/useAuthStore'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'
import { formatRelativeTime } from '../../lib/formatChatTime'

function SidebarSkeleton({ theme }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 px-3 py-3">
          <div className="size-12 rounded-full shrink-0" style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-full" style={{ width: '55%', backgroundColor: hexToRgba(theme.primary, 0.15) }} />
            <div className="h-2.5 rounded-full" style={{ width: '80%', backgroundColor: hexToRgba(theme.primary, 0.08) }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ConversationRow({ conversation, authUserId, isActive, iconColor, onClick }) {
  const other = conversation.otherParticipant
  const lastMessage = conversation.lastMessage
  const isOwnLastMessage = lastMessage?.senderId?._id === authUserId
  const isUnseen = !isOwnLastMessage && lastMessage && lastMessage.status !== 'read'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors"
      style={{ backgroundColor: isActive ? hexToRgba(iconColor, 0.12) : 'transparent' }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = hexToRgba(iconColor, 0.06) }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div
        className="size-12 rounded-full overflow-hidden border-2 shrink-0"
        style={{ borderColor: isUnseen ? iconColor : hexToRgba(iconColor, 0.2) }}
      >
        <img src={other?.avatar || DEFAULT_AVATAR_URL} alt={other?.username} className="w-full h-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${isUnseen ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-200'}`}>
            {other?.username || 'Unknown user'}
          </p>
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className={`text-xs truncate ${isUnseen ? 'font-bold text-slate-600 dark:text-slate-300' : 'text-slate-400 font-medium'}`}>
            {isOwnLastMessage && 'You: '}
            {conversation.lastMessageText || 'Say hello 👋'}
          </p>
          {isUnseen && (
            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: iconColor }} />
          )}
        </div>
      </div>
    </button>
  )
}

function ContactRow({ contact, iconColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexToRgba(iconColor, 0.06) }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div className="size-10 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: hexToRgba(iconColor, 0.22) }}>
        <img src={contact.avatar || DEFAULT_AVATAR_URL} alt={contact.username} className="w-full h-full object-cover" />
      </div>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{contact.username}</p>
    </button>
  )
}

export default function MessageSidebar({ activeUser, onSelectUser }) {
  const theme = useThemeStore((state) => state.getTheme())
  const authUser = useAuthStore((state) => state.authUser)
  const {
    conversations, contacts,
    isFetchingConversations, isFetchingContacts,
    fetchConversations, fetchContacts,
  } = useMessageStore()

  const [showContacts, setShowContacts] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const handleToggleContacts = () => {
    if (!showContacts && contacts.length === 0) fetchContacts()
    setShowContacts((prev) => !prev)
  }

  const existingContactIds = useMemo(
    () => new Set(conversations.map((c) => c.otherParticipant?._id).filter(Boolean)),
    [conversations]
  )

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => c.otherParticipant?.username?.toLowerCase().includes(q))
  }, [conversations, search])

  const newChatContacts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contacts
      .filter((c) => !existingContactIds.has(c._id))
      .filter((c) => !q || c.username?.toLowerCase().includes(q))
  }, [contacts, existingContactIds, search])

  const handleSelectConversation = (conversation) => {
    if (!conversation.otherParticipant) return
    onSelectUser(conversation.otherParticipant)
  }

  const handleSelectContact = (contact) => {
    onSelectUser(contact)
    setShowContacts(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b-2" style={{ borderColor: hexToRgba(theme.primary, 0.14) }}>
        <h2 className="text-xl font-extrabold bouncy-text flex items-center gap-2 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-[20px]" style={{ color: theme.primary }}>forum</span>
          Messages
        </h2>
        <button
          onClick={handleToggleContacts}
          className="size-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{
            backgroundColor: showContacts ? theme.primary : hexToRgba(theme.primary, 0.12),
            color: showContacts ? '#fff' : theme.primary,
          }}
          title="New message"
        >
          <span className="material-symbols-outlined text-[20px]">{showContacts ? 'close' : 'edit_square'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{ backgroundColor: hexToRgba(theme.primary, 0.06), border: `2px solid ${hexToRgba(theme.primary, 0.1)}` }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ color: hexToRgba(theme.primary, 0.6) }}>search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={showContacts ? 'Search people…' : 'Search conversations…'}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto mt-2">
        {showContacts ? (
          <div className="p-2">
            <p className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
              People you can message
            </p>
            {isFetchingContacts ? (
              <SidebarSkeleton theme={theme} />
            ) : newChatContacts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <span className="material-symbols-outlined text-4xl block mb-2" style={{ color: hexToRgba(theme.primary, 0.3) }}>
                  person_search
                </span>
                <p className="text-sm font-bold text-slate-400">
                  {contacts.length === 0
                    ? 'Follow or get followed by someone to start messaging.'
                    : 'No one new to message — you already have a conversation with everyone.'}
                </p>
              </div>
            ) : (
              newChatContacts.map((contact) => (
                <ContactRow
                  key={contact._id}
                  contact={contact}
                  iconColor={theme.primary}
                  onClick={() => handleSelectContact(contact)}
                />
              ))
            )}
          </div>
        ) : isFetchingConversations ? (
          <SidebarSkeleton theme={theme} />
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="material-symbols-outlined text-5xl block mb-3" style={{ color: hexToRgba(theme.primary, 0.28) }}>
              chat_bubble_outline
            </span>
            <p className="font-bold text-slate-400">No conversations yet</p>
            <p className="text-sm text-slate-400 mt-1">Tap the pencil icon to message a follower or someone you follow.</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation._id}
                conversation={conversation}
                authUserId={authUser?._id}
                isActive={activeUser?._id === conversation.otherParticipant?._id}
                iconColor={theme.primary}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
