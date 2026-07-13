import { useEffect, useMemo, useRef, useState } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'
import { useMessageStore } from '../../store/useMessageStore'
import { useAuthStore } from '../../store/useAuthStore'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'
import { formatMessageTime } from '../../lib/formatChatTime'

function ChatSkeleton({ theme }) {
  const bubbleWidths = ['40%', '55%', '30%', '48%', '35%']
  return (
    <div className="flex-1 p-6 space-y-4 overflow-hidden">
      {bubbleWidths.map((width, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div
            className="animate-pulse h-10 rounded-2xl"
            style={{ width, backgroundColor: hexToRgba(theme.primary, i % 2 === 0 ? 0.08 : 0.14) }}
          />
        </div>
      ))}
    </div>
  )
}

function EmptyChatState({ theme }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <span className="material-symbols-outlined text-6xl mb-4" style={{ color: hexToRgba(theme.primary, 0.25) }}>
        forum
      </span>
      <p className="text-lg font-extrabold text-slate-400">No messages to display</p>
      <p className="text-sm text-slate-400 mt-1">Pick someone from the left to start chatting.</p>
    </div>
  )
}

export default function ChatContainer({ activeUser }) {
  const theme = useThemeStore((state) => state.getTheme())
  const authUser = useAuthStore((state) => state.authUser)
  const onlineUsers = useAuthStore((state) => state.onlineUsers)
  const { messages, isFetchingMessages, isSendingMessage, sendMessage } = useMessageStore()

  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)

  const isOnline = activeUser && onlineUsers.includes(activeUser._id)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isFetchingMessages])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (event) => setImagePreview(event.target.result)
    reader.readAsDataURL(file)
  }

  const handleSend = async () => {
    const trimmed = text.trim()
    if ((!trimmed && !imagePreview) || isSendingMessage) return

    await sendMessage({ text: trimmed, image: imagePreview })
    setText('')
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const groupedMessages = useMemo(() => messages, [messages])

  if (!activeUser) {
    return (
      <div className="flex flex-col h-full">
        <EmptyChatState theme={theme} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b-2 shrink-0"
        style={{ borderColor: hexToRgba(theme.primary, 0.14) }}
      >
        <div className="relative">
          <div className="size-11 rounded-full overflow-hidden border-2" style={{ borderColor: hexToRgba(theme.primary, 0.22) }}>
            <img src={activeUser.avatar || DEFAULT_AVATAR_URL} alt={activeUser.username} className="w-full h-full object-cover" />
          </div>
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          )}
        </div>
        <div>
          <p className="font-extrabold text-slate-800 dark:text-white leading-tight">{activeUser.username}</p>
          <p className="text-xs font-bold" style={{ color: isOnline ? '#10b981' : '#94a3b8' }}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {isFetchingMessages ? (
        <ChatSkeleton theme={theme} />
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
          {groupedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-5xl mb-3" style={{ color: hexToRgba(theme.primary, 0.25) }}>waving_hand</span>
              <p className="font-bold text-slate-400">Say hello to {activeUser.username}!</p>
            </div>
          ) : (
            groupedMessages.map((message) => {
              const isOwn = message.senderId === authUser?._id
              return (
                <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm font-medium ${isOwn ? 'text-white' : 'text-slate-700 dark:text-slate-100'}`}
                      style={{
                        backgroundColor: isOwn ? theme.primary : hexToRgba(theme.primary, 0.1),
                        borderTopRightRadius: isOwn ? '4px' : undefined,
                        borderTopLeftRadius: !isOwn ? '4px' : undefined,
                      }}
                    >
                      {message.image && (
                        <img src={message.image} alt="attachment" className="rounded-xl mb-2 max-h-64 object-cover" />
                      )}
                      {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 mt-1 px-1">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={scrollRef} />
        </div>
      )}

      {/* Composer */}
      <div className="p-4 border-t-2 shrink-0" style={{ borderColor: hexToRgba(theme.primary, 0.14) }}>
        {imagePreview && (
          <div className="relative inline-block mb-3">
            <img src={imagePreview} alt="preview" className="h-20 rounded-xl border-2" style={{ borderColor: hexToRgba(theme.primary, 0.2) }} />
            <button
              onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="absolute -top-2 -right-2 size-6 rounded-full flex items-center justify-center bg-slate-800 text-white"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="size-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{ backgroundColor: hexToRgba(theme.primary, 0.1), color: theme.primary }}
            title="Attach image"
          >
            <span className="material-symbols-outlined text-[20px]">image</span>
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-full outline-none text-sm font-medium max-h-28 text-slate-700 dark:text-slate-100"
            style={{
              backgroundColor: hexToRgba(theme.primary, 0.06),
              border: `2px solid ${hexToRgba(theme.primary, 0.12)}`,
            }}
          />
          <button
            onClick={handleSend}
            disabled={(!text.trim() && !imagePreview) || isSendingMessage}
            className="size-10 rounded-full flex items-center justify-center shrink-0 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            style={{ backgroundColor: theme.primary }}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSendingMessage ? 'progress_activity' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
