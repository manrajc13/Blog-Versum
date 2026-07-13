export const formatRelativeTime = (date) => {
  if (!date) return ''
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${diffMin}m`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d`
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const formatMessageTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
