"use client"

import { useState, useRef } from "react"
import { usePlayerName } from "@/hooks/use-player-name"
import { useTheme } from "./theme-provider"

export function PlayerNameDisplay() {
  const { playerName } = usePlayerName()
  const { theme } = useTheme()
  const [showChangeText, setShowChangeText] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setShowChangeText(true)
    }, 150)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowChangeText(false)
  }

  return (
    <div className="text-center mb-12">
      <p
        className={`text-xl transition-all duration-300 ease-in-out cursor-pointer ${
          theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        My name is:{" "}
        <span
          className={`font-semibold transition-all duration-300 ease-in-out ${
            theme === "nord"
              ? showChangeText
                ? "text-[var(--quiz-accent-blue)]"
                : "text-[var(--quiz-accent-yellow)]"
              : "text-[var(--quiz-sakura-accent)]"
          }`}
        >
          {showChangeText ? "<change name in settings>" : playerName}
        </span>
      </p>
    </div>
  )
}
