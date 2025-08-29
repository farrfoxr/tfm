"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "nord" | "sakura"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("nord")

  useEffect(() => {
    const savedTheme = localStorage.getItem("quiz-theme") as Theme
    if (savedTheme && (savedTheme === "nord" || savedTheme === "sakura")) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("quiz-theme", theme)
    document.documentElement.className = `theme-${theme}`
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
