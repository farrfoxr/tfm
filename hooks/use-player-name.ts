"use client"

import { useState, useEffect } from "react"

export function usePlayerName() {
  const [playerName, setPlayerName] = useState<string>("")

  useEffect(() => {
    const savedName = localStorage.getItem("quiz-player-name")
    if (savedName) {
      setPlayerName(savedName)
    } else {
      // Generate random guest name
      const guestNumber = Math.floor(Math.random() * 9999) + 1
      const newName = `guest-${guestNumber}`
      setPlayerName(newName)
      localStorage.setItem("quiz-player-name", newName)
    }
  }, [])

  const updatePlayerName = (newName: string) => {
    setPlayerName(newName)
    localStorage.setItem("quiz-player-name", newName)
  }

  return { playerName, updatePlayerName }
}
