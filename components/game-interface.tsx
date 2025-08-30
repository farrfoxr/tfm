"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface Player {
  id: number
  name: string
  score: number
  isYou: boolean
}

interface Question {
  id: number
  equation: string
  answer: number
  operation: string
}

interface GameInterfaceProps {
  players: Player[]
  currentQuestion: Question
  timeRemaining: number
  comboCount: number
  isComboActive: boolean
  comboTimeRemaining: number
  showMultiplier: boolean
  multiplierText: string
  hasError: boolean
  myRank?: number
  onAnswerSubmit: (answer: string) => void
  onLeaveGame: () => void
  onGameEnd?: () => void
  onNextQuestion?: () => void
}

export default function GameInterface({
  players,
  currentQuestion,
  timeRemaining,
  comboCount,
  isComboActive,
  comboTimeRemaining,
  showMultiplier,
  multiplierText,
  hasError,
  myRank,
  onAnswerSubmit,
  onLeaveGame,
  onGameEnd,
  onNextQuestion,
}: GameInterfaceProps) {
  const { theme } = useTheme()
  const [answer, setAnswer] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState(5)
  const [showGameOver, setShowGameOver] = useState(false)
  const [hasSkippedQuestion, setHasSkippedQuestion] = useState(false)
  const [gameEndRequested, setGameEndRequested] = useState(false)

  useEffect(() => {
    if (inputRef.current && !showCountdown && !showGameOver) {
      inputRef.current.focus()
    }
  }, [currentQuestion.id, showCountdown, showGameOver])

  useEffect(() => {
    setAnswer("")
    setHasSkippedQuestion(false)
  }, [currentQuestion.id])

  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0 && !showCountdown) {
      setShowCountdown(true)
      setCountdownNumber(timeRemaining)
    }

    if (showCountdown && timeRemaining > 0) {
      setCountdownNumber(timeRemaining)
    }

    if (timeRemaining === 0 && !gameEndRequested) {
      setGameEndRequested(true)
    }
  }, [timeRemaining, showCountdown, gameEndRequested])

  useEffect(() => {
    if (gameEndRequested && !showGameOver) {
      setShowCountdown(false)
      setShowGameOver(true)

      setTimeout(() => {
        setShowGameOver(false)
        onGameEnd?.()
      }, 2000)
    }
  }, [gameEndRequested, showGameOver, onGameEnd])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim() && !showGameOver) {
      const isCorrect = Number.parseInt(answer.trim()) === currentQuestion.answer
      onAnswerSubmit(answer.trim())
      setAnswer("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }

  const timerProgress = isComboActive ? (comboTimeRemaining / 10) * 100 : (comboTimeRemaining / 20) * 100
  const isTimerLow = timeRemaining <= 10
  const timerAnimationDuration = isTimerLow ? "duration-150" : "duration-500"

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const topThreePlayers = sortedPlayers.slice(0, 3)
  const currentPlayer = players.find((p) => p.isYou)

  return (
    <div className={`min-h-screen ${theme === "nord" ? "theme-nord" : "theme-sakura"}`}>
      {showCountdown && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-2xl">
            <div
              key={countdownNumber}
              className={`absolute -right-32 top-1/2 transform -translate-y-1/2 text-9xl font-black animate-stamp ${
                theme === "nord" ? "text-[var(--quiz-accent-yellow)]" : "text-[var(--quiz-sakura-accent)]"
              }`}
              style={{
                textShadow: "4px 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)",
                filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))",
              }}
            >
              {countdownNumber}
            </div>
          </div>
        </div>
      )}

      {showGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className={`text-8xl font-black animate-stamp relative z-10 ${
              theme === "nord" ? "text-[var(--quiz-accent-blue)]" : "text-[var(--quiz-sakura-accent)]"
            }`}
            style={{
              textShadow: "6px 6px 12px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.3)",
              filter: "drop-shadow(0 0 15px rgba(0,0,0,0.7))",
            }}
          >
            GAME OVER
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-screen-2xl relative">
        <div className="flex items-start justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onLeaveGame}
            disabled={showCountdown || showGameOver}
            className={`flex items-center gap-2 text-lg ${
              theme === "nord"
                ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-text)] hover:bg-[var(--quiz-muted)]"
                : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-text)] hover:bg-[var(--quiz-sakura-muted)]"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            Leave Game
          </Button>

          <div
            className={`rounded-2xl p-4 min-w-[280px] shadow-sm`} // reduced shadow from shadow-lg to shadow-sm
            style={{
              backgroundColor: theme === "nord" ? "rgba(47, 53, 65, 0.4)" : "rgba(229, 221, 214, 0.4)",
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <span
                className={`text-lg font-bold ${
                  theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                }`}
              >
                Player
              </span>
              <span
                className={`text-lg font-bold ${
                  theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                }`}
              >
                Score
              </span>
            </div>
            <div className="space-y-2">
              {topThreePlayers.map((player, index) => (
                <div key={player.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
                      }`}
                    >
                      {index + 1}.
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        player.isYou
                          ? theme === "nord"
                            ? "text-[var(--quiz-accent-yellow)]"
                            : "text-[var(--quiz-sakura-accent)]"
                          : theme === "nord"
                            ? "text-[var(--quiz-text)]"
                            : "text-[var(--quiz-sakura-text)]"
                      }`}
                    >
                      {player.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                    }`}
                  >
                    {player.score.toLocaleString()}
                  </span>
                </div>
              ))}

              {myRank && myRank > 3 && currentPlayer && (
                <div
                  className={`flex justify-between items-center mt-3 pt-2 border-t ${
                    theme === "nord"
                      ? "border-[var(--quiz-primary)] bg-[var(--quiz-background)]/50"
                      : "border-[var(--quiz-sakura-secondary)] bg-[var(--quiz-sakura-background)]/50"
                  } rounded px-2 py-1`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
                      }`}
                    >
                      {myRank}.
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        theme === "nord" ? "text-[var(--quiz-accent-yellow)]" : "text-[var(--quiz-sakura-accent)]"
                      }`}
                    >
                      {currentPlayer.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                    }`}
                  >
                    {currentPlayer.score.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div
            className={`relative rounded-3xl p-12 max-w-2xl w-full text-center transition-all duration-300 ${
              hasError ? "animate-shake" : ""
            } ${
              theme === "nord"
                ? "bg-[var(--quiz-muted)] border border-[var(--quiz-primary)]"
                : "bg-[var(--quiz-sakura-muted)] border border-[var(--quiz-sakura-secondary)]"
            }`}
          >
            {showMultiplier && (
              <div
                className={`absolute -top-4 -right-4 px-4 py-2 rounded-full text-2xl font-bold animate-fade-in-out ${
                  theme === "nord"
                    ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)]"
                    : "bg-[var(--quiz-sakura-accent)] text-white"
                }`}
              >
                {multiplierText}
              </div>
            )}

            <div
              className={`text-6xl font-bold mb-8 ${
                theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
              }`}
            >
              {currentQuestion.equation}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your answer"
                className={`text-3xl text-center h-16 rounded-2xl border-2 font-semibold ${
                  theme === "nord"
                    ? "bg-[var(--quiz-background)] border-[var(--quiz-primary)] text-[var(--quiz-text)] placeholder:text-[var(--quiz-secondary)] focus:border-[var(--quiz-accent-blue)]"
                    : "bg-[var(--quiz-sakura-background)] border-[var(--quiz-sakura-secondary)] text-[var(--quiz-sakura-text)] placeholder:text-[var(--quiz-sakura-secondary)] focus:border-[var(--quiz-sakura-accent)]"
                }`}
              />
              <Button
                type="submit"
                size="lg"
                disabled={!answer.trim() || showGameOver}
                className={`h-12 px-8 text-lg font-semibold transition-all duration-300 ${
                  answer.trim() && !showGameOver
                    ? theme === "nord"
                      ? "bg-[var(--quiz-accent-blue)] hover:bg-[var(--quiz-accent-blue)]/90 text-[var(--quiz-background)]"
                      : "bg-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-accent)]/90 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
              >
                Submit Answer
              </Button>
            </form>
          </div>

          <div className="w-full max-w-2xl space-y-3">
            <div
              className={`h-3 rounded-full overflow-hidden ${
                theme === "nord" ? "bg-[var(--quiz-background)]" : "bg-[var(--quiz-sakura-background)]"
              }`}
            >
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  isComboActive
                    ? theme === "nord"
                      ? "bg-[var(--quiz-accent-yellow)]"
                      : "bg-[var(--quiz-sakura-accent)]"
                    : theme === "nord"
                      ? "bg-[var(--quiz-secondary)]"
                      : "bg-[var(--quiz-sakura-secondary)]"
                }`}
                style={{ width: `${timerProgress}%` }}
              />
            </div>

            <div className="text-center">
              <span
                className={`text-2xl font-light opacity-60 ${
                  timeRemaining <= 10
                    ? theme === "nord"
                      ? "text-[var(--quiz-accent-yellow)]"
                      : "text-[var(--quiz-sakura-accent)]"
                    : theme === "nord"
                      ? "text-[var(--quiz-secondary)]"
                      : "text-[var(--quiz-sakura-secondary)]"
                }`}
              >
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p
              className={`text-sm ${
                theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
              }`}
            >
              Tip: Press Enter to submit
            </p>
            {comboCount > 0 && (
              <p
                className={`text-lg font-bold ${
                  theme === "nord" ? "text-[var(--quiz-accent-yellow)]" : "text-[var(--quiz-sakura-accent)]"
                }`}
              >
                Combo: {comboCount} {isComboActive ? "🔥" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes stamp {
          0% {
            transform: scale(1.8) rotate(-5deg);
            opacity: 0;
          }
          20% {
            transform: scale(1.2) rotate(2deg);
            opacity: 1;
          }
          40% {
            transform: scale(0.95) rotate(-1deg);
            opacity: 1;
          }
          60% {
            transform: scale(1.05) rotate(0.5deg);
            opacity: 1;
          }
          80% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
        }
        
        .animate-stamp {
          animation: stamp 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
