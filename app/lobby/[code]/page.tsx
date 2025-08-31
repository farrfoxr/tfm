"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Copy, Users, Settings, ArrowLeft, Plus, Minus, X, Divide, Crown, Check } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { usePlayerName } from "@/hooks/use-player-name"
import { useSocket } from "@/context/SocketContext"
import { useLobby } from "@/context/LobbyContext"
import type { GameSettings } from "@/context/SocketContext"

export default function LobbyPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { playerName } = usePlayerName()
  const { socket } = useSocket()
  const { lobby, setLobby } = useLobby()

  const [copied, setCopied] = useState(false)
  // const [operations, setOperations] = useState({...})
  // const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("easy")
  // const [gameTime, setGameTime] = useState<2 | 3 | 5>(2)

  const lobbyCode = lobby?.code
  const isHost = socket?.id === lobby?.host

  useEffect(() => {
    if (!lobby) {
      router.replace("/")
      return
    }
  }, [lobby, router])

  useEffect(() => {
    if (!socket) return

    const handleLobbyUpdated = (lobbyData: any) => {
      setLobby(lobbyData)
    }

    socket.on("lobby-updated", handleLobbyUpdated)

    return () => {
      socket.off("lobby-updated", handleLobbyUpdated)
    }
  }, [socket, setLobby])

  const handleCopyCode = async () => {
    if (lobbyCode) {
      try {
        await navigator.clipboard.writeText(lobbyCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy lobby code:", err)
      }
    }
  }

  const handleLeaveLobby = () => {
    if (socket) {
      socket.emit("leave-lobby")
    }
    setLobby(null)
    router.push("/")
  }

  const handleLeaveGame = () => {
    // if (socket && lobbyCode) {
    //   socket.emit("leave-game", { lobbyCode })
    // }
  }

  const handleReady = () => {
    if (socket) {
      socket.emit("toggle-ready", (response) => {
        if (!response.success) {
          console.error("Failed to toggle ready status:", response.error)
        }
        // The UI will update automatically when the "lobby-updated" event is received.
      })
    }
  }

  const handleSettingsChange = (settings: Partial<GameSettings>) => {
    if (socket && isHost) {
      socket.emit("update-settings", settings)
    }
  }

  const handleOperationToggle = (operation: keyof GameSettings["operations"]) => {
    if (!lobby?.settings?.operations) return

    const newOperations = {
      ...lobby.settings.operations,
      [operation]: !lobby.settings.operations[operation],
    }

    // Ensure at least one operation is selected
    const hasAtLeastOne = Object.values(newOperations).some((value) => value)
    if (hasAtLeastOne) {
      handleSettingsChange({ operations: newOperations })
    }
  }

  const handleAnswerSubmit = (answer: string) => {
    // Game logic will be handled by server
  }

  const handleStartGame = () => {
    // socket.emit("start-game", { lobbyCode })
  }

  const handleGameEnd = () => {}

  const handleReturnToLobby = () => {
    // if (socket && lobbyCode) {
    //   socket.emit("reset-lobby", { lobbyCode })
    // }
  }

  const allPlayersReady = lobby?.players?.every((player: any) => player.isReady)
  const currentPlayer = lobby?.players?.find((p: any) => p.id === socket?.id)
  const canStartGame =
    isHost && currentPlayer?.isReady && (allPlayersReady || true) && (lobby?.players?.length ?? 0) >= 1

  if (!lobby) {
    return <div>Loading Lobby...</div>
  }

  // if (gameState.isEnded) {
  //   return <Leaderboard players={lobby?.players || []} onReturnToLobby={handleReturnToLobby} />
  // }

  // if (gameState.isActive) {
  //   return <GameInterface ... />
  // }

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
            <Settings
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
                  onClick={() => handleSettingsChange({ duration: 120 })}
                  disabled={!isHost}
                  size="sm"
                  className={`px-5 py-2 font-medium transition-all duration-300 ${
                    lobby?.settings?.duration === 120
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  2 mins
                </Button>
                <Button
                  onClick={() => handleSettingsChange({ duration: 180 })}
                  disabled={!isHost}
                  size="sm"
                  className={`px-5 py-2 font-medium transition-all duration-300 ${
                    lobby?.settings?.duration === 180
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  3 mins
                </Button>
                <Button
                  onClick={() => handleSettingsChange({ duration: 300 })}
                  disabled={!isHost}
                  size="sm"
                  className={`px-5 py-2 font-medium transition-all duration-300 ${
                    lobby?.settings?.duration === 300
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  onClick={() => handleSettingsChange({ difficulty: "easy" })}
                  disabled={!isHost}
                  size="sm"
                  className={`px-6 py-2 font-medium transition-all duration-300 ${
                    lobby?.settings?.difficulty === "easy"
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Easy
                </Button>
                <Button
                  onClick={() => handleSettingsChange({ difficulty: "medium" })}
                  disabled={!isHost}
                  size="sm"
                  className={`px-6 py-2 font-medium transition-all duration-300 ${
                    lobby?.settings?.difficulty === "medium"
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Medium
                </Button>
                <Button
                  onClick={() => handleSettingsChange({ difficulty: "hard" })}
                  disabled={!isHost}
                  size="sm"
                  className={`px-6 py-2 font-medium transition-all duration-300 ${
                    lobby?.settings?.difficulty === "hard"
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-yellow)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-yellow)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  disabled={!isHost}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    lobby?.settings?.operations?.addition
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Addition
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </Button>

                <Button
                  onClick={() => handleOperationToggle("subtraction")}
                  disabled={!isHost}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    lobby?.settings?.operations?.subtraction
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Subtraction
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                </Button>

                <Button
                  onClick={() => handleOperationToggle("multiplication")}
                  disabled={!isHost}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    lobby?.settings?.operations?.multiplication
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Multiplication
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleOperationToggle("division")}
                  disabled={!isHost}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    lobby?.settings?.operations?.division
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Division
                  <Divide className="h-4 w-4" strokeWidth={2.5} />
                </Button>

                <Button
                  onClick={() => handleOperationToggle("exponents")}
                  disabled={!isHost}
                  size="sm"
                  className={`px-3 py-2 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    lobby?.settings?.operations?.exponents
                      ? theme === "nord"
                        ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)] hover:bg-[var(--quiz-accent-blue)]/90"
                        : "bg-[var(--quiz-sakura-accent)] text-white hover:bg-[var(--quiz-sakura-accent)]/90"
                      : theme === "nord"
                        ? "bg-[var(--quiz-background)] text-[var(--quiz-secondary)] border border-[var(--quiz-primary)] hover:bg-[var(--quiz-primary)]/20 opacity-60"
                        : "bg-[var(--quiz-sakura-background)] text-[var(--quiz-sakura-secondary)] border border-[var(--quiz-sakura-secondary)] hover:bg-[var(--quiz-sakura-secondary)]/20 opacity-60"
                  } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
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
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5" />
            <span className="text-lg font-medium">{lobby?.players?.length || 0} Players</span>
          </div>

          {/* Player List */}
          <div className="space-y-3">
            {lobby?.players?.map((player: any) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  theme === "nord" ? "bg-[var(--quiz-background)]" : "bg-[var(--quiz-sakura-background)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {player.id === lobby?.host && (
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
                  {player.id === socket?.id && (
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
                  {player.id === lobby?.host && (
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
                  onClick={handleStartGame}
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
                    ? `Start Game (${lobby?.players?.length ?? 0} players)`
                    : `Start Game - DEBUG MODE (${lobby?.players?.filter((p: any) => p.isReady).length ?? 0}/${lobby?.players?.length ?? 0} ready)`}
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
              Players: {lobby?.players?.length} | Socket: Available | Player ID: {isHost ? "host" : "player"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
