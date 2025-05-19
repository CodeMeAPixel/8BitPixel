"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Gamepad, Component, Globe, Zap } from "lucide-react"

interface Game {
  id: string
  title: string
  shortDescription: string
  description: string
  url: string
  category?: string
  featured?: boolean
  dateAdded?: string
  hasComponent?: boolean
  usesGameEngine?: boolean
}

interface GameCardProps {
  game: Game
  showViewDetails?: boolean
}

export function GameCard({ game, showViewDetails = false }: GameCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Use the actual screenshot path with jpg extension
  const screenshotPath = `/screenshots/${game.id}.jpg`

  // Generate a placeholder image URL as fallback
  const placeholderImageUrl = `/placeholder.svg?height=675&width=1200&query=${encodeURIComponent(
    `${game.title} game screenshot with ${game.shortDescription}`,
  )}`

  // Fallback colors based on game ID for error state
  const getGameColors = (gameId: string) => {
    const colorMap: Record<string, { from: string; to: string }> = {
      wordisles: { from: "from-cyan-600", to: "to-blue-800" },
      emojigrid: { from: "from-cyan-500", to: "to-blue-500" },
      catmazes: { from: "from-blue-500", to: "to-indigo-600" },
      breaktheice: { from: "from-indigo-600", to: "to-violet-800" },
    }

    return colorMap[gameId] || { from: "from-cyan-500", to: "to-blue-600" }
  }

  const { from, to } = getGameColors(game.id)

  return (
    <div
      ref={cardRef}
      className="group relative bg-gray-900/90 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:scale-[1.03] pixel-border border border-gray-800 hover:border-cyan-900/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* Fallback gradient background (shown during loading or on error) */}
        {(!isImageLoaded || hasImageError) && (
          <div className={`absolute inset-0 bg-gradient-to-br ${from} ${to} flex items-center justify-center`}>
            <Gamepad className="w-16 h-16 text-white text-opacity-30" />
          </div>
        )}

        {/* Game screenshot */}
        <Image
          src={hasImageError ? placeholderImageUrl : screenshotPath}
          alt={`${game.title} screenshot`}
          className={`object-cover w-full h-full transition-all duration-500 ${
            isImageLoaded && !hasImageError ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.5s ease-out",
          }}
          width={1200}
          height={675}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            setHasImageError(true)
            console.error(`Failed to load image: ${screenshotPath}, falling back to placeholder`)
          }}
          priority={game.id === "wordisles"} // Load the first game image with priority
        />

        {/* Hover overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            {game.title}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 text-xs rounded-full flex items-center ${
              game.hasComponent 
                ? 'bg-cyan-900/30 text-cyan-400' 
                : 'bg-gray-800 text-gray-400'
            }`}>
              {game.hasComponent ? (
                <>
                  <Component className="w-3 h-3 mr-1" />
                  <span>Native</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  <span>External</span>
                </>
              )}
            </div>
            
            {/* Display badge for games using our engine */}
            {game.usesGameEngine && (
              <div className="px-2 py-1 text-xs rounded-full flex items-center bg-indigo-900/30 text-indigo-400">
                <Zap className="w-3 h-3 mr-1" />
                <span>8BitGE</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-300 mb-2 text-sm">{game.shortDescription}</p>
        <p className="text-gray-400 mb-6 flex-grow text-sm">{game.description}</p>
        
        {showViewDetails ? (
          <div className="flex flex-col space-y-3">
            <Link
              href={`/games/${game.id}`}
              className="inline-flex items-center justify-center px-6 py-3 border border-cyan-900/50 text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-1 active:translate-y-0"
            >
              View Details
            </Link>
            <Link
              href={`/games/${game.id}/play`}
              className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-cyan-900/30 text-base font-medium rounded-md text-cyan-400 hover:bg-cyan-900/10 transition-all duration-300"
            >
              Play Now {game.hasComponent ? <Component size={18} className="ml-2" /> : <ExternalLink size={18} className="ml-2" />}
            </Link>
          </div>
        ) : (
          <Link
            href={`/games/${game.id}/play`}
            className="inline-flex items-center justify-center px-6 py-3 border border-cyan-900/50 text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-1 active:translate-y-0"
          >
            Play Now {game.hasComponent ? <Component size={18} className="ml-2" /> : <ExternalLink size={18} className="ml-2" />}
          </Link>
        )}
      </div>

      {/* Glow effect on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
    </div>
  )
}
