"use client"

import type React from "react"
import { useTheme } from "@/components/theme-provider" // Fixed import path to use theme-provider instead of non-existent hooks/use-theme
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import useSocket from "@/hooks/use-socket"
import { useRouter } from "next/navigation"
import { usePlayerName } from "@/hooks/use-player-name"
import { useLobby } from "@/context/LobbyContext"

interface JoinLobbyOverlayProps {
  isOpen: boolean
  onClose: () => void
  onJoin: (code: string) => void
}

export function JoinLobbyOverlay({ isOpen, onClose, onJoin }: JoinLobbyOverlayProps) {
  const { theme } = useTheme()
  const { socket } = useSocket()
  const router = useRouter()
  const { playerName } = usePlayerName()
  const { setLobby } = useLobby()
  const [lobbyCode, setLobbyCode] = useState("")
  const [error, setError] = useState("")
  const [isShaking, setIsShaking] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 4)
    setLobbyCode(value)
    if (error) {
      setError("")
      setIsShaking(false)
    }
  }

  const handleJoin = () => {
    if (lobbyCode.length !== 4) {
      showError("Lobby code must be 4 letters")
      return
    }

    if (!socket) {
      showError("Connection error. Please try again.")
      return
    }

    socket.emit("join-lobby", lobbyCode, playerName, (response: any) => {
      if (response.success) {
        setLobby(response.lobby)
        router.push(`/lobby/${lobbyCode}`)
        onClose()
      } else {
        console.error(response.error)
        showError(response.error || "Failed to join lobby")
      }
    })
  }

  const showError = (message: string) => {
    setError(message)
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div
        className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl ${
          theme === "nord"
            ? "bg-[var(--quiz-muted)] border border-[var(--quiz-primary)]"
            : "bg-[var(--quiz-sakura-muted)] border border-[var(--quiz-sakura-secondary)]"
        }`}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={`absolute top-4 right-4 h-8 w-8 ${
            theme === "nord"
              ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-text)] hover:bg-[var(--quiz-primary)]/20"
              : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-text)] hover:bg-[var(--quiz-sakura-accent)]/20"
          }`}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Title */}
        <h2
          className={`text-2xl font-bold mb-6 text-center ${
            theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
          }`}
        >
          Enter Lobby Code
        </h2>

        {/* Tip Text */}
        <p
          className={`text-sm mb-6 text-center ${
            theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
          }`}
        >
          Tip: the lobby code is always 4 letters
        </p>

        {/* Input */}
        <div className="mb-6">
          <Input
            value={lobbyCode}
            onChange={handleInputChange}
            placeholder="ABCD"
            className={`text-center text-2xl font-bold tracking-widest h-14 ${
              theme === "nord"
                ? "bg-[var(--quiz-background)] border-[var(--quiz-primary)] text-[var(--quiz-text)] placeholder:text-[var(--quiz-secondary)]"
                : "bg-[var(--quiz-sakura-background)] border-[var(--quiz-sakura-secondary)] text-[var(--quiz-sakura-text)] placeholder:text-[var(--quiz-sakura-secondary)]"
            }`}
            maxLength={4}
          />
        </div>

        {/* Error Message */}
        <div className="h-8 mb-4">
          {error && (
            <p
              className={`text-red-500 text-sm text-center transition-all duration-300 ${
                isShaking ? "animate-shake" : ""
              }`}
            >
              {error}
            </p>
          )}
        </div>

        {/* Join Button */}
        <Button
          onClick={handleJoin}
          disabled={lobbyCode.length !== 4}
          className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
            theme === "nord"
              ? "bg-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-accent-yellow)]/90 text-[var(--quiz-background)] disabled:bg-[var(--quiz-primary)] disabled:text-[var(--quiz-secondary)]"
              : "bg-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-accent)]/90 text-white disabled:bg-[var(--quiz-sakura-secondary)] disabled:text-[var(--quiz-sakura-background)]"
          }`}
        >
          Join Lobby
        </Button>
      </div>
    </div>
  )
}
