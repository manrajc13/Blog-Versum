import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fallbackTheme, themeConfig } from './themeConfig'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      themeId: fallbackTheme.id,
      setTheme: (themeId) => {
        if (!themeConfig[themeId]) {
          return
        }
        set({ themeId })
      },
      getTheme: () => {
        const { themeId } = get()
        return themeConfig[themeId] || fallbackTheme
      },
    }),
    {
      name: 'blogversum-theme',
      partialize: (state) => ({ themeId: state.themeId }),
    },
  ),
)
