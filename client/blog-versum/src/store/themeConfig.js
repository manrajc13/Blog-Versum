export const themeConfig = {
  plain: {
    id: 'plain',
    label: 'Plain',
    primary: '#334155',
    homeBackground: '#edf2f9',
    settingsBackground: 'rgba(230, 238, 249, 0.98)',
    settingsPanelBackground: 'rgba(148, 163, 184, 0.34)',
  },
  sunshine: {
    id: 'sunshine',
    label: 'Sunshine',
    primary: '#d97706',
    homeBackground: '#fff1c7',
    settingsBackground: 'rgba(255, 235, 179, 0.98)',
    settingsPanelBackground: 'rgba(245, 158, 11, 0.3)',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    primary: '#4f46e5',
    homeBackground: '#dfe5ff',
    settingsBackground: 'rgba(211, 223, 255, 0.98)',
    settingsPanelBackground: 'rgba(99, 102, 241, 0.28)',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean Breeze',
    primary: '#0891b2',
    homeBackground: '#d8f7ff',
    settingsBackground: 'rgba(190, 242, 255, 0.98)',
    settingsPanelBackground: 'rgba(6, 182, 212, 0.26)',
  },
  cotton: {
    id: 'cotton',
    label: 'Cotton Candy',
    primary: '#db2777',
    homeBackground: '#ffe0f0',
    settingsBackground: 'rgba(255, 215, 236, 0.98)',
    settingsPanelBackground: 'rgba(236, 72, 153, 0.24)',
  },
  forest: {
    id: 'forest',
    label: 'Forest Adventure',
    primary: '#059669',
    homeBackground: '#daf7e9',
    settingsBackground: 'rgba(200, 245, 223, 0.98)',
    settingsPanelBackground: 'rgba(5, 150, 105, 0.23)',
  },
}

export const fallbackTheme = themeConfig.plain

export function hexToRgba(hex, alpha = 1) {
  const sanitized = hex.replace('#', '')
  const valid = sanitized.length === 3
    ? sanitized.split('').map((ch) => ch + ch).join('')
    : sanitized

  const bigint = Number.parseInt(valid, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
