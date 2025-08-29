"use client"

import { useTheme } from "./theme-provider"

export function AnimatedTitle() {
  const { theme } = useTheme()

  return (
    <div className="text-center mb-8">
      <h1
        className={`text-6xl md:text-7xl font-bold animate-float-rotate ${
          theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
        }`}
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
      >
        Think Fast: Math
      </h1>
      <div
        className={`w-24 h-1 mx-auto mt-4 rounded-full ${
          theme === "nord" ? "bg-[var(--quiz-accent-yellow)]" : "bg-[var(--quiz-sakura-accent)]"
        }`}
      />
    </div>
  )
}
