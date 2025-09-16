"use client"

import { Button } from "@/components/ui/button"
import { Crown, Medal, Trophy, Users } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import type { Player } from "@/context/SocketContext"

interface LeaderboardProps {
  players: Player[]
  onReturnToLobby: () => void
  isHost: boolean
}

export function Leaderboard({ players, onReturnToLobby, isHost }: LeaderboardProps) {
  const { theme } = useTheme()

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 3)

  const allSortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const currentPlayer = players.find((player) => player.isYou)
  const currentPlayerRank = currentPlayer
    ? allSortedPlayers.findIndex((player) => player.id === currentPlayer.id) + 1
    : null

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-amber-600"
      default:
        return theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
    }
  }

  return (
    <div className={`min-h-screen ${theme === "nord" ? "theme-nord" : "theme-sakura"}`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
          {/* Title */}
          <div className="text-center space-y-4">
            <h1
              className={`text-4xl font-bold ${
                theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
              }`}
            >
              🎉 Game Complete! 🎉
            </h1>
            <p
              className={`text-xl ${
                theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
              }`}
            >
              Final Leaderboard
            </p>
          </div>

          {/* Leaderboard Container */}
          <div
            className={`w-full max-w-2xl rounded-3xl p-8 ${
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
                className={`text-2xl font-bold ${
                  theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                }`}
              >
                Top 3 Players
              </h2>
            </div>

            <div className="space-y-3">
              {sortedPlayers.map((player, index) => {
                const rank = index + 1
                const isTopThree = rank <= 3

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                      player.isYou
                        ? theme === "nord"
                          ? "bg-[var(--quiz-accent-yellow)]/20 border-2 border-[var(--quiz-accent-yellow)]"
                          : "bg-[var(--quiz-sakura-accent)]/20 border-2 border-[var(--quiz-sakura-accent)]"
                        : theme === "nord"
                          ? "bg-[var(--quiz-background)]"
                          : "bg-[var(--quiz-sakura-background)]"
                    } ${isTopThree ? "ring-2 ring-opacity-50" : ""} ${
                      rank === 1 ? "ring-yellow-500" : rank === 2 ? "ring-gray-400" : rank === 3 ? "ring-amber-600" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {getRankIcon(rank)}
                        <span className={`text-2xl font-bold ${getRankColor(rank)}`}>#{rank}</span>
                      </div>

                      {/* Player Name */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-semibold ${
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
                        {player.isYou && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              theme === "nord"
                                ? "bg-[var(--quiz-accent-blue)] text-[var(--quiz-background)]"
                                : "bg-[var(--quiz-sakura-accent)] text-white"
                            }`}
                          >
                            You
                          </span>
                        )}
                        {rank === 1 && <Crown className="h-5 w-5 text-yellow-500" />}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <span
                        className={`text-xl font-bold ${
                          theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                        }`}
                      >
                        {player.score.toLocaleString()}
                      </span>
                      <p
                        className={`text-sm ${
                          theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
                        }`}
                      >
                        points
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {currentPlayerRank && currentPlayerRank > 3 && (
              <div className="mt-6 pt-4 border-t border-opacity-20 border-current">
                <div className="text-center">
                  <span
                    className={`text-xl font-semibold ${
                      theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                    }`}
                  >
                    Your ranking: #{currentPlayerRank}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Return to Lobby Button */}
          <Button
            onClick={onReturnToLobby}
            disabled={!isHost}
            size="lg"
            className={`h-14 px-8 text-lg font-semibold transition-all duration-300 ${
              theme === "nord"
                ? "bg-[var(--quiz-accent-blue)] hover:bg-[var(--quiz-accent-blue)]/90 text-[var(--quiz-background)]"
                : "bg-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-accent)]/90 text-white"
            } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Return to Lobby
          </Button>

          {/* Tip text for non-host players */}
          {!isHost && (
            <p
              className={`text-sm text-center mt-2 ${theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"}`}
            >
              Only the host can return the party to the lobby.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
