import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SocketProvider } from "@/context/SocketContext"
import { LobbyProvider } from "@/context/LobbyContext"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Think Fast: Math",
  description: "Real-time math speed quiz game",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${poppins.variable} antialiased`}>
        <ThemeProvider>
          <SocketProvider>
            <LobbyProvider>{children}</LobbyProvider>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
