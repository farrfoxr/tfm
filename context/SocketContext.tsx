"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface Player {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  score: number
  isYou?: boolean
}

interface Question {
  id: number
  equation: string
  answer: number
  operation: string
}

interface GameSettings {
  difficulty: "easy" | "medium" | "hard"
  duration: number // This value is in seconds
  questionCount?: number // Make this property optional to match backend interface
  operations: {
    addition: boolean
    subtraction: boolean
    multiplication: boolean
    division: boolean
    exponents: boolean
  }
}

interface GameState {
  isActive: boolean
  currentQuestionIndex: number
  questions: Question[]
  timeRemaining: number
  comboCount: number
  isComboActive: boolean
  comboTimeRemaining: number
  isEnded: boolean
}

interface Lobby {
  code: string
  players: Player[]
  settings: GameSettings
  gameState: GameState
  host: string
  isGameActive: boolean
}

interface ServerToClientEvents {
  "lobby-updated": (lobby: Lobby) => void
  "game-started": (gameState: GameState) => void
  "question-updated": (question: Question, timeRemaining: number) => void
  "player-answered": (playerId: string, isCorrect: boolean, newScore: number) => void
  "timer-update": (timeRemaining: number) => void
  "game-ended": (finalScores: Player[]) => void
  "return-to-lobby": () => void
  error: (message: string) => void
}

interface ClientToServerEvents {
  "create-lobby": (
    playerName: string,
    callback: (response: { success: boolean; lobby?: Lobby; error?: string }) => void,
  ) => void
  "join-lobby": (
    code: string,
    playerName: string,
    callback: (response: { success: boolean; lobby?: Lobby; error?: string }) => void,
  ) => void
  "leave-lobby": () => void
  "toggle-ready": (callback: (response: { success: boolean; isReady?: boolean; error?: string }) => void) => void
  "start-game": () => void
  "submit-answer": (payload: { questionId: number; answer: string; timeTaken: number }) => void
  "update-settings": (settings: Partial<GameSettings>) => void
  "return-to-lobby": () => void
}

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

interface SocketContextType {
  socket: SocketType | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<SocketType | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io("http://localhost:3001") as SocketType

    socketInstance.on("connect", () => {
      console.log("Connected to server")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    })

    socketInstance.on("timer-update", (timeRemaining: number) => {
      console.log("Timer updated:", timeRemaining)
    })

    socketInstance.on("return-to-lobby", () => {
      console.log("Returned to lobby")
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export type { GameSettings, GameState, Player, Question, Lobby }
