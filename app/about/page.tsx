"use client"

import Link from "next/link"
import { ArrowLeft, Globe, Github, Instagram, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

const SOCIAL_LINKS = {
  website: "#", // Replace with your website URL
  github: "#", // Replace with your GitHub URL
  instagram: "#", // Replace with your Instagram URL
  linkedin: "#", // Replace with your LinkedIn URL
}

export default function AboutPage() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen ${theme === "nord" ? "theme-nord" : "theme-sakura"}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 border-b border-opacity-20"
        style={{
          borderColor: theme === "nord" ? "var(--quiz-muted)" : "var(--quiz-sakura-muted)",
        }}
      >
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 transition-all duration-300 hover:scale-110 ${
              theme === "nord"
                ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)] hover:bg-[var(--quiz-muted)]"
                : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)] hover:bg-[var(--quiz-sakura-muted)]"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1
          className={`text-2xl font-bold ${
            theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
          }`}
        >
          About
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 py-6">
        <div className="flex gap-0 w-full max-h-[75vh]">
          {/* Left Column - Main Content */}
          <div
            className="w-[80%] flex justify-center py-4 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor:
                theme === "nord" ? "rgba(136, 192, 208, 0.2) transparent" : "rgba(255, 183, 197, 0.2) transparent",
              direction: "rtl",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 1px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background-color: ${theme === "nord" ? "rgba(136, 192, 208, 0.3)" : "rgba(255, 183, 197, 0.3)"};
                border-radius: 1px;
                border: none;
              }
              div::-webkit-scrollbar-thumb:hover {
                background-color: ${theme === "nord" ? "rgba(136, 192, 208, 0.5)" : "rgba(255, 183, 197, 0.5)"};
              }
              div::-webkit-scrollbar-corner {
                background: transparent;
              }
            `}</style>

            <div className="w-full max-w-6xl px-2 pr-8 pb-8" style={{ direction: "ltr" }}>
              <h1
                className={`text-5xl font-semibold mb-6 text-left ${
                  theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                }`}
              >
                Hello,
              </h1>

              <div className="text-left w-full">
                <p
                  className={`text-lg leading-relaxed text-justify ${
                    theme === "nord" ? "text-[var(--quiz-secondary)]" : "text-[var(--quiz-sakura-secondary)]"
                  }`}
                >
                  Thanks for playing this game I worked hard on. I created this game with the intention of making us
                  productive while we're idling or waiting on something for 1-5 minutes. Nowadays we tend to scroll on
                  social media whenever we're queuing in a game lobby for too long, or idling in class while waiting for
                  a teacher, or just when we're bored.
                  <br />
                  <br />
                  Math is a skill we use every day, but as we grow older, many of us practice it less. I noticed my own
                  basic math skills getting duller, especially since my later university semesters are more math-heavy
                  than coding-heavy. I notice my basic math operations skills are becoming more dull by the day, since
                  there is more coding than math in my final semesters of university.
                  <br />
                  <br />
                  So I wanted to play a game that improves my math, instead of just doom scrolling. But I couldn't find
                  a game like this (or at least, one aesthetic enough and pleasing to the eye). So I decided to take it
                  up on my own and created this game from scratch. At first, it was just a single player game to idle,
                  but while I was at it, I decided to implement multiplayers, with scoring systems, a cool combo
                  animation, and a leaderboard so we can invite our friends to play with us.
                  <br />
                  <br />I recommend starting with easy mode and just toggle basic operations like addition and
                  substractions to start out. Once your math skills are back up and ready, try messing around with the
                  other operations and difficulty.
                  <br />
                  <br />
                  Don't stress too much about the leaderboards, this game isn't made with the intention to be super
                  competitive. What's important is that we are better than who we were yesterday, choosing to improve
                  our maths little by little everyday, and replacing our doomscrolling habit when idling -- even if it
                  is just by a little bit.
                  <br />
                  <br />
                  Thank you, I hope this game can be fun and useful for you all!
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Social Links */}
          <div className="w-[20%] flex items-center justify-start pl-2 min-w-0">
            <div className="w-full max-w-[160px]">
              <h2
                className={`text-xl font-bold mb-6 text-left ${
                  theme === "nord" ? "text-[var(--quiz-text)]" : "text-[var(--quiz-sakura-text)]"
                }`}
              >
                My links
              </h2>

              <div className="flex flex-col gap-4 items-start">
                <a
                  href={SOCIAL_LINKS.website}
                  className={`flex items-center gap-2 text-base sm:text-lg transition-colors duration-300 truncate w-full ${
                    theme === "nord"
                      ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)]"
                      : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)]"
                  }`}
                >
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">Website</span>
                </a>

                <a
                  href={SOCIAL_LINKS.github}
                  className={`flex items-center gap-2 text-base sm:text-lg transition-colors duration-300 truncate w-full ${
                    theme === "nord"
                      ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)]"
                      : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)]"
                  }`}
                >
                  <Github className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">GitHub</span>
                </a>

                <a
                  href={SOCIAL_LINKS.instagram}
                  className={`flex items-center gap-2 text-base sm:text-lg transition-colors duration-300 truncate w-full ${
                    theme === "nord"
                      ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)]"
                      : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)]"
                  }`}
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">Instagram</span>
                </a>

                <a
                  href={SOCIAL_LINKS.linkedin}
                  className={`flex items-center gap-2 text-base sm:text-lg transition-colors duration-300 truncate w-full ${
                    theme === "nord"
                      ? "text-[var(--quiz-secondary)] hover:text-[var(--quiz-accent-yellow)]"
                      : "text-[var(--quiz-sakura-secondary)] hover:text-[var(--quiz-sakura-accent)]"
                  }`}
                >
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
