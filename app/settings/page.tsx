"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Palette, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"
import { usePlayerName } from "@/hooks/use-player-name"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { playerName, updatePlayerName } = usePlayerName()
  const [tempName, setTempName] = useState(playerName)

  const handleSaveName = () => {
    if (tempName.trim()) {
      updatePlayerName(tempName.trim())
    }
  }

  const handleThemeChange = (newTheme: "nord" | "sakura") => {
    setTheme(newTheme)
  }

  return (
    <div className={`min-h-screen ${theme === "nord" ? "theme-nord" : "theme-sakura"}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 border-b border-opacity-20"
        style={{
          borderColor: theme === "nord" ? "var(--quiz-muted)" : "var(--quiz-sakura-muted)",
        }}
      >
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 transition-all duration-300 hover:scale-110 ${
              theme === "nord"
                ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-muted)]"
                : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-muted)]"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1
          className={`text-2xl font-bold ${
            theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
          }`}
        >
          Settings
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Player Name Section */}
        <div
          className={`p-6 rounded-lg border-2 ${
            theme === "nord"
              ? "bg-[var(--quiz-muted)] border-[var(--quiz-primary)]"
              : "bg-[var(--quiz-sakura-muted)] border-[var(--quiz-sakura-accent)]"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <User
              className={`h-5 w-5 ${
                theme === "nord" ? "text-[var(--quiz-accent-yellow)]" : "text-[var(--quiz-sakura-accent)]"
              }`}
            />
            <h2
              className={`text-xl font-semibold ${
                theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
              }`}
            >
              Player Name
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="playerName"
                className={`text-sm ${
                  theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
                }`}
              >
                Display Name
              </Label>
              <Input
                id="playerName"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className={`mt-1 ${
                  theme === "nord"
                    ? "bg-[var(--quiz-bg)] border-[var(--quiz-primary)] text-[var(--quiz-text)] focus:border-[var(--quiz-accent-yellow)]"
                    : "bg-[var(--quiz-sakura-bg)] border-[var(--quiz-sakura-accent)] text-[var(--quiz-sakura-text)] focus:border-[var(--quiz-sakura-accent)]"
                }`}
                placeholder="Enter your name"
              />
            </div>
            <Button
              onClick={handleSaveName}
              className={`transition-all duration-300 hover:scale-105 ${
                theme === "nord"
                  ? "bg-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-accent-blue)] text-[var(--quiz-bg)]"
                  : "bg-[var(--quiz-sakura-accent)] hover:opacity-90 text-white"
              }`}
            >
              Save Name
            </Button>
          </div>
        </div>

        {/* Theme Section */}
        <div
          className={`p-6 rounded-lg border-2 ${
            theme === "nord"
              ? "bg-[var(--quiz-muted)] border-[var(--quiz-primary)]"
              : "bg-[var(--quiz-sakura-muted)] border-[var(--quiz-sakura-accent)]"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Palette
              className={`h-5 w-5 ${
                theme === "nord" ? "text-[var(--quiz-accent-blue)]" : "text-[var(--quiz-sakura-accent)]"
              }`}
            />
            <h2
              className={`text-xl font-semibold ${
                theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
              }`}
            >
              Theme
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nord Theme */}
            <button
              onClick={() => handleThemeChange("nord")}
              className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                theme === "nord"
                  ? "border-[var(--quiz-accent-yellow)] bg-[var(--quiz-bg)]"
                  : "border-gray-300 bg-[#242933] hover:border-[#e9c46a]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-[#e9c46a]" />
                <div className="w-4 h-4 rounded-full bg-[#87bfcf]" />
                <div className="w-4 h-4 rounded-full bg-[#6d7686]" />
              </div>
              <p className="text-[#eceff4] font-medium">Nord Dark</p>
              <p className="text-[#97a1b4] text-sm">Cool & focused</p>
            </button>

            {/* Sakura Theme */}
            <button
              onClick={() => handleThemeChange("sakura")}
              className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                theme === "sakura"
                  ? "border-[var(--quiz-sakura-accent)] bg-[var(--quiz-sakura-bg)]"
                  : "border-gray-300 bg-[#f2eee9] hover:border-[#af6a81]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-[#af6a81]" />
                <div className="w-4 h-4 rounded-full bg-[#e5ddd6]" />
                <div className="w-4 h-4 rounded-full bg-[#67574c]" />
              </div>
              <p className="text-[#67574c] font-medium">Sakura Pink</p>
              <p className="text-[#67574c] opacity-70 text-sm">Warm & gentle</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
