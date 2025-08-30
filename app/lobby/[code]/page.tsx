"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Crown, Users, SettingsIcon, Plus, Minus, X, Divide, Check } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { usePlayerName } from "@/hooks/use-player-name"
import useSocket from "@/hooks/use-socket" // Added socket hook for real-time updates
import GameInterface from "@/components/game-interface"
import Leaderboard from "@/components/leaderboard"

interface Player {
  id: number
  name: string
  isHost: boolean
  isReady: boolean
  isYou: boolean
  score: number // Added score for game tracking
}

interface Question {
  id: number
  equation: string
  answer: number
  operation: string
}

interface GameState {
  isActive: boolean
  currentQuestionIndex: number
  questions: Question[]
  timeRemaining: number
  comboCount: number
  isComboActive: boolean
  comboTimeRemaining: number
  playerAnswer: string
  showMultiplier: boolean
  multiplierText: string
  hasError: boolean
  isEnded: boolean
}

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const { playerName } = usePlayerName()
  const { socket } = useSocket() // Fixed: destructure socket from the hook return value

  const [lobbyCode] = useState(params.code as string)
  const [isHost, setIsHost] = useState(true) // Mock: creator is always host
  const [copied, setCopied] = useState(false)

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastCorrectAnswerTime = useRef<number>(0)

  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    currentQuestionIndex: 0,
    questions: [],
    timeRemaining: 120, // 120 seconds total game time
    comboCount: 0,
    isComboActive: false,
    comboTimeRemaining: 20, // Start with 20s base timer
    playerAnswer: "",
    showMultiplier: false,
    multiplierText: "1x",
    hasError: false,
    isEnded: false,
  })

  const [players, setPlayers] = useState<Player[]>([])
  const [lobby, setLobby] = useState<any | null>(null)

  const [operations, setOperations] = useState({
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
    exponents: false,
  })

  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("easy")
  const [gameTime, setGameTime] = useState<2 | 3 | 5>(2)

  useEffect(() => {
    if (!socket) return

    const handleLobbyUpdated = (lobbyData: any) => {
      setLobby(lobbyData)
      // Update players from lobby data
      if (lobbyData.players) {
        setPlayers(lobbyData.players)
      }
    }

    socket.on("lobby-updated", handleLobbyUpdated)

    return () => {
      socket.off("lobby-updated", handleLobbyUpdated)
    }
  }, [socket])

  useEffect(() => {
    const code = params.code as string

    // Validate lobby code format (should be exactly 4 letters)
    const isValidLobbyCode = /^[A-Za-z]{4}$/.test(code)

    if (!isValidLobbyCode) {
      // Invalid lobby code format - redirect to home
      router.replace("/")
      return
    }

    // Connect to WebSocket server with lobby code
    // Send join/create lobby request
    // Handle server responses for lobby state
    // Implement real-time player updates
    // Add proper error handling for non-existent lobbies
    console.log(`Attempting to join/create lobby: ${code}`)
  }, [params.code, router, socket])

  useEffect(() => {
    if (gameState.isActive && gameState.timeRemaining > 0) {
      gameTimerRef.current = setTimeout(() => {
        setGameState((prev) => {
          const newTimeRemaining = prev.timeRemaining - 1
          if (newTimeRemaining <= 0) {
            handleGameEnd()
            return { ...prev, timeRemaining: 0 }
          }
          return { ...prev, timeRemaining: newTimeRemaining }
        })
      }, 1000)
    }

    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current)
      }
    }
  }, [gameState.isActive, gameState.timeRemaining])

  useEffect(() => {
    if (gameState.isActive && gameState.comboTimeRemaining > 0) {
      comboTimerRef.current = setTimeout(() => {
        setGameState((prev) => {
          const newComboTime = prev.comboTimeRemaining - 1
          if (newComboTime <= 0) {
            // Timer expired - skip question and reset combo
            const nextQuestionIndex = prev.currentQuestionIndex + 1
            const needsMoreQuestions = nextQuestionIndex >= prev.questions.length

            if (needsMoreQuestions) {
              // Generate more questions
              const newQuestions = generateQuestions(operations, difficulty)
              return {
                ...prev,
                questions: [...prev.questions, ...newQuestions],
                currentQuestionIndex: nextQuestionIndex,
                comboCount: 0,
                isComboActive: false,
                comboTimeRemaining: 20, // Reset to base timer
                hasError: false,
              }
            } else {
              return {
                ...prev,
                currentQuestionIndex: nextQuestionIndex,
                comboCount: 0,
                isComboActive: false,
                comboTimeRemaining: 20, // Reset to base timer
                hasError: false,
              }
            }
          }
          return { ...prev, comboTimeRemaining: newComboTime }
        })
      }, 1000)
    }

    return () => {
      if (comboTimerRef.current) {
        clearTimeout(comboTimerRef.current)
      }
    }
  }, [gameState.isActive, gameState.comboTimeRemaining])

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current)
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (playerName) {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => (player.isYou ? { ...player, name: playerName } : player)),
      )
    }
  }, [playerName])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(lobbyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy lobby code:", err)
    }
  }

  const handleLeaveLobby = () => {
    router.push("/")
  }

  const handleLeaveGame = () => {
    // Notify other players
    socket.emit("leave-game", { lobbyCode })
    setGameState((prev) => ({ ...prev, isActive: false }))
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current)
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
  }

  const handleReady = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => (player.isYou ? { ...player, isReady: !player.isReady } : player)),
    )
    socket.emit("player-ready", { lobbyCode })
  }

  const handleOperationToggle = (operation: keyof typeof operations) => {
    const newOperations = { ...operations, [operation]: !operations[operation] }

    // Ensure at least one operation is selected
    const hasAtLeastOne = Object.values(newOperations).some((value) => value)
    if (hasAtLeastOne) {
      setOperations(newOperations)
      socket.emit("update-operations", { lobbyCode, operations: newOperations })
    }
  }

  const handleAnswerSubmit = (answer: string) => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    const isCorrect = Number.parseInt(answer) === currentQuestion.answer
    const currentTime = Date.now()

    if (isCorrect) {
      // Calculate current multiplier based on combo count
      let currentMultiplier = 1.0
      if (gameState.comboCount >= 2) {
        // Combo starts at 3rd consecutive correct (comboCount = 2)
        const comboLevel = gameState.comboCount - 1 // 2nd correct = level 1
        currentMultiplier = Math.min(1.1 + (comboLevel - 1) * 0.05, 2.0) // Cap at 2.0x
      }

      // Calculate score: base 100 points × multiplier
      const scoreGain = Math.round(100 * currentMultiplier)

      // Update player score
      setPlayers((prev) =>
        prev.map((player) => (player.isYou ? { ...player, score: player.score + scoreGain } : player)),
      )
      socket.emit("update-score", { lobbyCode, scoreGain })

      // Check if combo should continue (within 7 seconds of last correct answer)
      const timeSinceLastCorrect = currentTime - lastCorrectAnswerTime.current
      const shouldContinueCombo = gameState.comboCount > 0 && timeSinceLastCorrect <= 7000

      const newComboCount = shouldContinueCombo ? gameState.comboCount + 1 : 1
      const isComboActive = newComboCount >= 2 // Combo visual starts at 2 consecutive correct answers

      lastCorrectAnswerTime.current = currentTime

      // Show multiplier feedback
      const nextMultiplier = newComboCount >= 2 ? Math.min(1.1 + (newComboCount - 2) * 0.05, 2.0) : 1.0
      const multiplierText = `${nextMultiplier.toFixed(2)}x`

      setGameState((prev) => ({
        ...prev,
        comboCount: newComboCount,
        isComboActive,
        comboTimeRemaining: isComboActive ? 10 : 20, // 10s for combo, 20s for base
        showMultiplier: true,
        multiplierText,
        hasError: false,
      }))

      // Hide multiplier after 2 seconds
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, showMultiplier: false }))
      }, 2000)

      // Move to next question
      setTimeout(() => {
        handleNextQuestion()
      }, 500)
    } else {
      // Wrong answer - apply penalty based on current multiplier
      let currentMultiplier = 1.0
      if (gameState.comboCount >= 2) {
        const comboLevel = gameState.comboCount - 1
        currentMultiplier = Math.min(1.1 + (comboLevel - 1) * 0.05, 2.0)
      }

      // Calculate penalty: base 25 points × min(multiplier, 1.5)
      const penaltyMultiplier = Math.min(currentMultiplier, 1.5)
      const scoreLoss = Math.round(25 * penaltyMultiplier)

      // Update player score (subtract penalty)
      setPlayers((prev) =>
        prev.map((player) => (player.isYou ? { ...player, score: Math.max(0, player.score - scoreLoss) } : player)),
      )
      socket.emit("update-score", { lobbyCode, scoreLoss: -scoreLoss })

      // Wrong answer - break combo and show error
      setGameState((prev) => ({
        ...prev,
        comboCount: 0,
        isComboActive: false,
        comboTimeRemaining: 20, // Reset to base timer
        hasError: true,
        showMultiplier: false,
      }))

      // Clear error state after animation
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, hasError: false }))
      }, 500)

      // No longer wait for timer - immediately move to next question
      handleNextQuestion()
    }
  }

  const handleNextQuestion = () => {
    setGameState((prev) => {
      const nextQuestionIndex = prev.currentQuestionIndex + 1
      const needsMoreQuestions = nextQuestionIndex >= prev.questions.length

      if (needsMoreQuestions) {
        // Generate more questions
        const newQuestions = generateQuestions(operations, difficulty)
        return {
          ...prev,
          questions: [...prev.questions, ...newQuestions],
          currentQuestionIndex: nextQuestionIndex,
          comboTimeRemaining: prev.isComboActive ? 10 : 20, // Reset timer for new question
        }
      } else {
        return {
          ...prev,
          currentQuestionIndex: nextQuestionIndex,
          comboTimeRemaining: prev.isComboActive ? 10 : 20, // Reset timer for new question
        }
      }
    })
  }

  const handleStartGame = () => {
    // Send game start signal to all players
    socket.emit("start-game", { lobbyCode })
    const questions = generateQuestions(operations, difficulty)
    const timeInSeconds = gameTime * 60
    setGameState((prev) => ({
      ...prev,
      isActive: true,
      isEnded: false,
      questions,
      currentQuestionIndex: 0,
      timeRemaining: timeInSeconds,
      comboCount: 0,
      isComboActive: false,
      comboTimeRemaining: 20,
      playerAnswer: "",
      showMultiplier: false,
      hasError: false,
    }))
    lastCorrectAnswerTime.current = 0
  }

  const handleGameEnd = () => {
    setTimeout(() => {
      setGameState((prev) => ({ ...prev, isActive: false, isEnded: true }))
    }, 2000)

    if (gameTimerRef.current) clearTimeout(gameTimerRef.current)
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
  }

  const handleReturnToLobby = () => {
    const timeInSeconds = gameTime * 60
    setGameState((prev) => ({
      ...prev,
      isActive: false,
      isEnded: false,
      currentQuestionIndex: 0,
      questions: [],
      timeRemaining: timeInSeconds,
      comboCount: 0,
      isComboActive: false,
      comboTimeRemaining: 20,
      playerAnswer: "",
      showMultiplier: false,
      multiplierText: "1x",
      hasError: false,
    }))
    // Reset all players' ready status
    setPlayers((prev) => prev.map((player) => ({ ...player, isReady: false })))
    socket.emit("reset-lobby", { lobbyCode })
  }

  const generateQuestions = (enabledOps: typeof operations, diff: "easy" | "normal" | "hard"): Question[] => {
    const questions: Question[] = []
    const ops = Object.entries(enabledOps)
      .filter(([_, enabled]) => enabled)
      .map(([op, _]) => op)

    const generateWeightedNumber = (min: number, max: number, favorLarger = true): number => {
      if (!favorLarger || max <= 9) {
        return Math.floor(Math.random() * (max - min + 1)) + min
      }

      // Weight system: 15% chance for 1-digit, 85% chance for multi-digit
      const useSmall = Math.random() < 0.15
      if (useSmall && min <= 9) {
        return Math.floor(Math.random() * Math.min(9, max) + 1) + (min <= 1 ? 0 : min - 1)
      } else {
        const largerMin = Math.max(min, 10)
        return Math.floor(Math.random() * (max - largerMin + 1)) + largerMin
      }
    }

    const generateAddition = (): { equation: string; answer: number } => {
      let maxRange: number
      if (diff === "easy") {
        maxRange = 99 // 1-2 digits
      } else if (diff === "normal") {
        maxRange = 999 // up to 3 digits
      } else {
        maxRange = 99999 // up to 5 digits
      }

      const a = generateWeightedNumber(1, maxRange)
      const b = generateWeightedNumber(1, maxRange)
      return { equation: `${a} + ${b}`, answer: a + b }
    }

    const generateSubtraction = (): { equation: string; answer: number } => {
      let maxRange: number
      if (diff === "easy") {
        maxRange = 99 // 1-2 digits
      } else if (diff === "normal") {
        maxRange = 999 // up to 3 digits
      } else {
        maxRange = 99999 // up to 5 digits
      }

      let a = generateWeightedNumber(10, maxRange)
      let b = generateWeightedNumber(10, maxRange)

      // Ensure a > b to avoid negative results
      if (b > a) {
        ;[a, b] = [b, a]
      }

      return { equation: `${a} - ${b}`, answer: a - b }
    }

    const generateMultiplication = (): { equation: string; answer: number } => {
      let a: number, b: number

      if (diff === "easy") {
        // Easy: one 1-digit (1-9), other 1-2 digits (1-99)
        const useFirstAsSmall = Math.random() < 0.5
        if (useFirstAsSmall) {
          a = Math.floor(Math.random() * 9) + 1 // 1 digit
          b = generateWeightedNumber(1, 99, false) // 1-2 digits
        } else {
          a = generateWeightedNumber(1, 99, false) // 1-2 digits
          b = Math.floor(Math.random() * 9) + 1 // 1 digit
        }
      } else if (diff === "normal") {
        // Normal: both up to 2 digits (1-99)
        a = generateWeightedNumber(1, 99, false)
        b = generateWeightedNumber(1, 99, false)
      } else {
        // Hard: both up to 3 digits (1-999)
        a = generateWeightedNumber(1, 999, false)
        b = generateWeightedNumber(1, 999, false)
      }

      return { equation: `${a} × ${b}`, answer: a * b }
    }

    const generateDivision = (): { equation: string; answer: number } => {
      let a: number, b: number

      if (diff === "easy") {
        // Easy: either divisor or quotient is 1-digit, other is 1-2 digits
        const useDivisorAsSmall = Math.random() < 0.5
        if (useDivisorAsSmall) {
          a = Math.floor(Math.random() * 9) + 2 // 1 digit divisor (2-9)
          b = generateWeightedNumber(1, 99, false) // 1-2 digit quotient
        } else {
          a = generateWeightedNumber(2, 99, false) // 1-2 digit divisor
          b = Math.floor(Math.random() * 9) + 1 // 1 digit quotient
        }
      } else if (diff === "normal") {
        // Normal: both up to 2 digits
        a = generateWeightedNumber(2, 99, false) // Divisor
        b = generateWeightedNumber(1, 99, false) // Quotient
      } else {
        // Hard: both up to 3 digits
        a = generateWeightedNumber(2, 999, false) // Divisor
        b = generateWeightedNumber(1, 999, false) // Quotient
      }

      const c = a * b // Dividend
      return { equation: `${c} ÷ ${a}`, answer: b }
    }

    const generateExponents = (): { equation: string; answer: number } => {
      let baseRange: number
      if (diff === "easy") {
        baseRange = 20 // base 1-20
      } else if (diff === "normal") {
        baseRange = 30 // base 1-30
      } else {
        baseRange = 50 // base 1-50
      }

      const base = Math.floor(Math.random() * baseRange) + 1
      const operationType = Math.floor(Math.random() * 3) // 0: x², 1: x³, 2: √(x²)

      switch (operationType) {
        case 0: // x²
          return { equation: `${base}²`, answer: base * base }
        case 1: // x³
          return { equation: `${base}³`, answer: base * base * base }
        case 2: // √(x²)
          const squared = base * base
          return { equation: `√${squared}`, answer: base }
        default:
          return { equation: `${base}²`, answer: base * base }
      }
    }

    const getWeightedOperation = (): string => {
      const weights: { [key: string]: number } = {}

      if (diff === "easy") {
        // Easy: Add/Sub 30% each, Mult/Div 15% each, Exp 10%
        if (ops.includes("addition")) weights.addition = 30
        if (ops.includes("subtraction")) weights.subtraction = 30
        if (ops.includes("multiplication")) weights.multiplication = 15
        if (ops.includes("division")) weights.division = 15
        if (ops.includes("exponents")) weights.exponents = 10
      } else if (diff === "normal") {
        // Normal: Add/Sub 25% each, Mult/Div 20% each, Exp 10%
        if (ops.includes("addition")) weights.addition = 25
        if (ops.includes("subtraction")) weights.subtraction = 25
        if (ops.includes("multiplication")) weights.multiplication = 20
        if (ops.includes("division")) weights.division = 20
        if (ops.includes("exponents")) weights.exponents = 10
      } else {
        // Hard: Add/Sub 20% each, Mult/Div 25% each, Exp 10%
        if (ops.includes("addition")) weights.addition = 20
        if (ops.includes("subtraction")) weights.subtraction = 20
        if (ops.includes("multiplication")) weights.multiplication = 25
        if (ops.includes("division")) weights.division = 25
        if (ops.includes("exponents")) weights.exponents = 10
      }

      // Normalize weights to sum to 100
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
      const normalizedWeights: { [key: string]: number } = {}
      Object.entries(weights).forEach(([op, weight]) => {
        normalizedWeights[op] = (weight / totalWeight) * 100
      })

      // Select operation based on weights
      const random = Math.random() * 100
      let cumulative = 0
      for (const [operation, weight] of Object.entries(normalizedWeights)) {
        cumulative += weight
        if (random <= cumulative) {
          return operation
        }
      }

      return ops[0] // Fallback
    }

    // Generate 40 questions
    for (let i = 0; i < 40; i++) {
      const operation = getWeightedOperation()
      let questionData: { equation: string; answer: number }

      switch (operation) {
        case "addition":
          questionData = generateAddition()
          break
        case "subtraction":
          questionData = generateSubtraction()
          break
        case "multiplication":
          questionData = generateMultiplication()
          break
        case "division":
          questionData = generateDivision()
          break
        case "exponents":
          questionData = generateExponents()
          break
        default:
          questionData = generateAddition() // Fallback
      }

      questions.push({
        id: i + 1,
        equation: questionData.equation,
        answer: questionData.answer,
        operation,
      })
    }

    return questions
  }

  const currentPlayer = players.find((p) => p.isYou)
  const allPlayersReady = players.every((player) => player.isReady)
  const canStartGame = isHost && currentPlayer?.isReady && (allPlayersReady || true) && players.length >= 1 // Debug: Allow start even if not all players ready

  if (gameState.isEnded) {
    return <Leaderboard players={players} onReturnToLobby={handleReturnToLobby} />
  }

  if (gameState.isActive) {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    if (!currentQuestion) {
      return <div>Loading...</div>
    }

    return (
      <GameInterface
        players={players}
        currentQuestion={currentQuestion}
        timeRemaining={gameState.timeRemaining}
        comboCount={gameState.comboCount}
        isComboActive={gameState.isComboActive}
        comboTimeRemaining={gameState.comboTimeRemaining}
        showMultiplier={gameState.showMultiplier}
        multiplierText={gameState.multiplierText}
        hasError={gameState.hasError}
        myRank={[...players].sort((a, b) => b.score - a.score).findIndex((p) => p.isYou) + 1}
        onAnswerSubmit={handleAnswerSubmit}
        onLeaveGame={handleLeaveGame}
        onGameEnd={handleGameEnd}
        onNextQuestion={handleNextQuestion}
      />
    )
  }

  return (
    <div className={`min-h-screen ${theme === "nord" ? "theme-nord" : "theme-sakura"}`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleLeaveLobby}
            className={`flex items-center gap-2 text-lg ${
              theme === "nord"
                ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-text)] hover:bg-[var(--quiz-muted)]"
                : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-text)] hover:bg-[var(--quiz-sakura-muted)]"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            Leave Lobby
          </Button>
          <div className="text-center">
            <h1
              className={`text-3xl font-bold mb-2 ${
                theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
              }`}
            >
              Game Lobby
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg ${
                  theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
                }`}
              >
                Code:
              </span>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  theme === "nord" ? "bg-[var(--quiz-muted)]" : "bg-[var(--quiz-sakura-muted)]"
                }`}
              >
                <span
                  className={`text-xl font-bold tracking-wider ${
                    theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                  }`}
                >
                  {lobbyCode}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className={`h-8 w-8 p-0 ${
                    theme === "nord"
                      ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-text)] hover:bg-[var(--quiz-muted)]"
                      : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-text)] hover:bg-[var(--quiz-sakura-muted)]"
                  }`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <span
                  className={`text-sm ${
                    theme === "nord" ? "text-[var(--quiz-accent-yellow)]" : "text-[var(--quiz-sakura-accent)]"
                  }`}
                >
                  Copied!
                </span>
              )}
            </div>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Game Settings Container */}
        <div
          className={`rounded-2xl p-6 mb-6 ${
            theme === "nord"
              ? "bg-[var(--quiz-muted)] border border-[var(--quiz-primary)]"
              : "bg-[var(--quiz-sakura-muted)] border border-[var(--quiz-sakura-secondary)]"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon
              className={`h-6 w-6 ${theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"}`}
            />
            <h2
              className={`text-xl font-bold ${
                theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
              }`}
            >
              Game Settings
            </h2>
          </div>

          <div className="space-y-6">
            {/* Time Setting */}
            <div className="flex items-center justify-between">
              <span
                className={`text-lg font-medium ${
                  theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                }`}
              >
                Game Time:
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setGameTime(2)}
                  size="sm"
                  className={`px-5 py-2 font-medium transition-all duration-300 ${
                    gameTime === 2
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  }`}
                >
                  2 mins
                </Button>
                <Button
                  onClick={() => setGameTime(3)}
                  size="sm"
                  className={`px-5 py-2 font-medium transition-all duration-300 ${
                    gameTime === 3
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  }`}
                >
                  3 mins
                </Button>
                <Button
                  onClick={() => setGameTime(5)}
                  size="sm"
                  className={`px-5 py-2 font-medium transition-all duration-300 ${
                    gameTime === 5
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  }`}
                >
                  5 mins
                </Button>
              </div>
            </div>

            {/* Difficulty Setting */}
            <div className="flex items-center justify-between">
              <span
                className={`text-lg font-medium ${
                  theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                }`}
              >
                Difficulty:
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setDifficulty("easy")}
                  size="sm"
                  className={`px-6 py-2 font-medium transition-all duration-300 ${
                    difficulty === "easy"
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  }`}
                >
                  Easy
                </Button>
                <Button
                  onClick={() => setDifficulty("normal")}
                  size="sm"
                  className={`px-6 py-2 font-medium transition-all duration-300 ${
                    difficulty === "normal"
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  }`}
                >
                  Normal
                </Button>
                <Button
                  onClick={() => setDifficulty("hard")}
                  size="sm"
                  className={`px-6 py-2 font-medium transition-all duration-300 ${
                    difficulty === "hard"
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  }`}
                >
                  Hard
                </Button>
              </div>
            </div>

            {/* Operations Setting */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-lg font-medium ${
                    theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                  }`}
                >
                  Operations:
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <Button
                  onClick={() => handleOperationToggle("addition")}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    operations.addition
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  }`}
                >
                  Addition
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </Button>

                <Button
                  onClick={() => handleOperationToggle("subtraction")}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    operations.subtraction
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  }`}
                >
                  Subtraction
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                </Button>

                <Button
                  onClick={() => handleOperationToggle("multiplication")}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    operations.multiplication
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  }`}
                >
                  Multiplication
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleOperationToggle("division")}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    operations.division
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  }`}
                >
                  Division
                  <Divide className="h-4 w-4" strokeWidth={2.5} />
                </Button>

                <Button
                  onClick={() => handleOperationToggle("exponents")}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    operations.exponents
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  }`}
                >
                  Exponents
                  <span className="text-sm">a²</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Players Container */}
        <div
          className={`rounded-2xl p-6 mb-8 ${
            theme === "nord"
              ? "bg-[var(--quiz-muted)] border border-[var(--quiz-primary)]"
              : "bg-[var(--quiz-sakura-muted)] border border-[var(--quiz-sakura-secondary)]"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users
              className={`h-6 w-6 ${theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"}`}
            />
            <h2
              className={`text-xl font-bold ${
                theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
              }`}
            >
              Players ({players.length}/20)
            </h2>
          </div>

          {/* Player List */}
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  theme === "nord" ? "bg-[var(--quiz-background)]" : "bg-[var(--quiz-sakura-background)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {player.isHost && (
                    <Crown
                      className={`h-5 w-5 ${
                        theme === "nord" ? "text-[var(--quiz-accent-yellow)]" : "text-[var(--quiz-sakura-accent)]"
                      }`}
                    />
                  )}
                  <span
                    className={`font-semibold ${
                      theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                    }`}
                  >
                    {player.name}
                  </span>
                  {player.isYou && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        theme === "nord"
                          ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)]"
                          : "bg-[var(--quiz-sakura-accent)] text-white"
                      }`}
                    >
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {player.isReady && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-500 text-white">
                      <Check className="h-3 w-3" />
                      Ready
                    </div>
                  )}
                  {player.isHost && (
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        theme === "nord"
                          ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)]"
                          : "bg-[var(--quiz-sakura-accent)] text-white"
                      }`}
                    >
                      Host
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-4">
          {/* Ready/Start Button */}
          {isHost ? (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={handleReady}
                size="lg"
                className={`h-14 px-8 text-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  currentPlayer?.isReady
                    ? theme === "nord"
                      ? "bg-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-accent-yellow)]/90 text-[var(--quiz-background)]"
                      : "bg-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-accent)]/90 text-white"
                    : theme === "nord"
                      ? "bg-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/90 text-[var(--quiz-text)]"
                      : "bg-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/90 text-white"
                }`}
              >
                {currentPlayer?.isReady && <Check className="h-5 w-5" />}
                {currentPlayer?.isReady ? "Ready!" : "Mark as Ready"}
              </Button>

              {currentPlayer?.isReady && (
                <Button
                  onClick={handleStartGame} // Connected to game start handler
                  disabled={!canStartGame}
                  size="lg"
                  className={`h-16 px-12 text-xl font-bold transition-all duration-300 ${
                    canStartGame
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] hover:bg-[var(--quiz-accent-blue)]/90 text-[var(--quiz-background)]"
                        : "bg-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-accent)]/90 text-white"
                      : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {allPlayersReady
                    ? `Start Game (${players.length} players)`
                    : `Start Game - DEBUG MODE (${players.filter((p) => p.isReady).length}/${players.length} ready)`}
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={handleReady}
              size="lg"
              className={`h-14 px-8 text-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                currentPlayer?.isReady
                  ? theme === "nord"
                    ? "bg-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-accent-yellow)]/90 text-[var(--quiz-background)]"
                    : "bg-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-accent)]/90 text-white"
                  : theme === "nord"
                    ? "bg-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/90 text-[var(--quiz-text)]"
                    : "bg-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/90 text-white"
              }`}
            >
              {currentPlayer?.isReady && <Check className="h-5 w-5" />}
              {currentPlayer?.isReady ? "Ready!" : "Mark as Ready"}
            </Button>
          )}

          {/* Connection Status */}
          <div className="text-center mt-8">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                theme === "nord"
                  ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)]"
                  : "bg-[var(--quiz-sakura-accent)] text-white"
              }`}
            >
              Connected
            </div>
            <p
              className={`text-sm mt-4 ${
                theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
              }`}
            >
              Players: {players.length} | Socket: Available | Player ID: {isHost ? "host" : "player"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
