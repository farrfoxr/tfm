"use client"

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react"
import type { Lobby } from "./SocketContext"

interface LobbyContextType {
  lobby: Lobby | null
  setLobby: Dispatch<SetStateAction<Lobby | null>>
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
