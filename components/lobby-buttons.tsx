"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Users } from "lucide-react"
import { useTheme } from "./theme-provider"
import { JoinLobbyOverlay } from "./join-lobby-overlay"
import { useRouter } from "next/navigation"

export function LobbyButtons() {
  const { theme } = useTheme()
  const router = useRouter()
  const [showJoinOverlay, setShowJoinOverlay] = useState(false)

  const handleCreateLobby = () => {
    const lobbyCode = generateLobbyCode()
    // TODO: For real websocket implementation, change back to `/${lobbyCode}`
    // when websocket server can handle lobby validation and routing
    router.push(`/lobby/${lobbyCode}`)
  }

  const handleJoinLobby = () => {
    setShowJoinOverlay(true)
  }

  const generateLobbyCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let result = ""
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length))
    }
    return result
  }

  const handleJoinLobbyCode = (code: string) => {
    setShowJoinOverlay(false)
    // TODO: For real websocket implementation, change back to `/${code}`
    // when websocket server can handle lobby validation and routing
    router.push(`/lobby/${code}`)
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
        <Button
          onClick={handleCreateLobby}
          size="lg"
          className={`h-16 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
            theme === "nord"
              ? "bg-[var(--quiz-muted)] hover:bg-[var(--quiz-primary)] text-[var(--quiz-text)] border-[var(--quiz-primary)] border-2"
              : "bg-[var(--quiz-sakura-muted)] hover:bg-[var(--quiz-sakura-accent)] text-[var(--quiz-sakura-text)] hover:text-white border-[var(--quiz-sakura-secondary)] border-2"
          }`}
        >
          <Edit className="mr-3 h-5 w-5" />
          Create a Lobby
        </Button>

        <Button
          onClick={handleJoinLobby}
          size="lg"
          className={`h-16 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
            theme === "nord"
              ? "bg-[var(--quiz-muted)] hover:bg-[var(--quiz-primary)] text-[var(--quiz-text)] border-[var(--quiz-primary)] border-2"
              : "bg-[var(--quiz-sakura-muted)] hover:bg-[var(--quiz-sakura-accent)] text-[var(--quiz-sakura-text)] hover:text-white border-[var(--quiz-sakura-secondary)] border-2"
          }`}
        >
          <Users className="mr-3 h-5 w-5" />
          Join a Lobby
        </Button>
      </div>

      <JoinLobbyOverlay
        isOpen={showJoinOverlay}
        onClose={() => setShowJoinOverlay(false)}
        onJoin={handleJoinLobbyCode}
      />
    </>
  )
}
