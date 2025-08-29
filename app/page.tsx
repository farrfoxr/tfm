"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedTitle } from "@/components/animated-title"
import { PlayerNameDisplay } from "@/components/player-name-display"
import { LobbyButtons } from "@/components/lobby-buttons"
import { useTheme } from "@/components/theme-provider"

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col ${theme === "nord" ? "theme-nord" : "theme-sakura"}`}>
      {/* Settings Button */}
      <div className="absolute top-6 left-6">
        <Link href="/settings">
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full transition-all duration-300 hover:scale-110 ${
              theme === "nord"
                ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-muted)]"
                : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-muted)]"
            }`}
          >
            <Settings className="h-7 w-7" />
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <AnimatedTitle />
        <PlayerNameDisplay />
        <LobbyButtons />
      </div>
    </div>
  )
}
