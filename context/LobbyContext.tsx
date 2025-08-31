"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Player {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  score: number
  isYou?: boolean // isYou is optional and set client-side
}

interface GameSettings {
  difficulty: "easy" | "medium" | "hard"
  duration: number
  questionCount: number
}

interface Lobby {
  code: string
  players: Player[]
  settings: GameSettings
  host: string
}

interface LobbyContextType {
  lobby: Lobby | null
  setLobby: (lobby: Lobby | null) => void
}

const LobbyContext = createContext<LobbyContextType | undefined>(undefined)

export function LobbyProvider({ children }: { children: ReactNode }) {
  const [lobby, setLobby] = useState<Lobby | null>(null)

  return <LobbyContext.Provider value={{ lobby, setLobby }}>{children}</LobbyContext.Provider>
}

export function useLobby() {
  const context = useContext(LobbyContext)
  if (context === undefined) {
    throw new Error("useLobby must be used within a LobbyProvider")
  }
  return context
}
