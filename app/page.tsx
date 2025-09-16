"use client"

import Link from "next/link"
import { Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedTitle } from "@/components/animated-title"
import { PlayerNameDisplay } from "@/components/player-name-display"
import { LobbyButtons } from "@/components/lobby-buttons"
import { useTheme } from "@/components/theme-provider"

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col ${theme === "nord" ? "theme-nord" : "theme-sakura"}`}>
      {/* Settings and About Buttons */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Link href="/settings">
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 md:h-14 md:w-14 rounded-full transition-all duration-300 hover:scale-110 ${
              theme === "nord"
                ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-muted)]"
                : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-muted)]"
            }`}
          >
            <Settings className="h-6 w-6 md:h-7 md:w-7" />
          </Button>
        </Link>

        <Link href="/about">
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 md:h-14 md:w-14 rounded-full transition-all duration-300 hover:scale-110 ${
              theme === "nord"
                ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-muted)]"
                : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-muted)]"
            }`}
          >
            <Info className="h-6 w-6 md:h-7 md:w-7" />
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
