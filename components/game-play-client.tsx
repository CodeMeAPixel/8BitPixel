"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Game } from "@/lib/games"
import { ArrowLeft, Maximize2, Minimize2, Home, RefreshCcw, HelpCircle } from "lucide-react"
import { GameLoader } from "@/components/game-loader"
import { GameRulesModal } from "@/components/game-rules-modal"
import { Button } from "@/components/ui/button"
import { getGameById } from "@/lib/games"

interface GamePlayClientProps {
  game: Game
}

export function GamePlayClient({ game }: GamePlayClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showRules, setShowRules] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Handle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setShowControls(false)
    setTimeout(() => setShowControls(true), 300)
  }
  // Handle game reload
  const reloadGame = () => {
    setIsLoading(true)
    // Use a slightly longer delay for component games to ensure they fully reset
    setTimeout(() => setIsLoading(false), game.hasComponent ? 1500 : 1000)
  }

  const gameData = game // Assuming game data is directly available in the game prop

  // While loading or if game not found, show appropriate state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-gray-400">Loading game...</p>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Game Not Found</h1>
        <p className="text-gray-400 mb-6">Sorry, we couldn't find the game you're looking for.</p>
        <Link href="/games" className="text-cyan-500 hover:underline">
          Browse all games
        </Link>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}>
      {!isFullscreen && <Navbar />}
      
      <main className={`${isFullscreen ? 'h-screen pt-0' : 'pt-20 pb-8'}`}>
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isFullscreen ? 'max-w-full h-full' : 'max-w-7xl'}`}>
          {/* Game controls */}
          {showControls && (
            <div className={`flex items-center justify-between mb-4 transition-all duration-300 ${isFullscreen ? 'absolute top-4 left-4 right-4 z-10 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg' : ''}`}>
              <div className="flex items-center">
                <Link 
                  href={`/games/${game.id}`}
                  className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className={isFullscreen ? 'hidden sm:inline' : ''}>Back</span>
                </Link>

                <Link 
                  href="/"
                  className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mr-4"
                >
                  <Home className="w-5 h-5 mr-2" />
                  <span className={isFullscreen ? 'hidden sm:inline' : ''}>Home</span>
                </Link>
              </div>
              
              <div className="flex items-center">
                <h1 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mr-4">
                  {game.title}
                </h1>
                
                <button
                  onClick={reloadGame}
                  className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  title="Reload Game"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRules(true)}
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                  title="Game Rules"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}          {/* Game Container */}
          <div 
            className={`relative bg-gray-900/90 border border-gray-800 ${isFullscreen ? 'h-full rounded-none' : 'aspect-video rounded-xl shadow-lg pixel-border'}`}
            onMouseEnter={() => isFullscreen && setShowControls(true)}
            onMouseLeave={() => isFullscreen && setShowControls(false)}
          >
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="text-center">
                  <div className="inline-block w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-300 font-medium">Loading {game.title}...</p>
                  <p className="text-gray-500 text-sm mt-2">Please wait while the game loads</p>
                </div>
              </div>
            )}
            
            {/* Render game component or fallback to iframe */}
            {!isLoading && (
              <>
                {game.hasComponent ? (
                  <div className="w-full h-full rounded-xl">
                    <GameLoader gameId={game.id as any} />
                  </div>
                ) : (
                  <iframe
                    src={game.url}
                    title={`Play ${game.title}`}
                    className="w-full h-full rounded-xl"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    loading="lazy"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Game rules modal */}
      <GameRulesModal
        gameData={gameData}
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />
    </div>
  )
}

export default function GamePlayClientWrapper({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await getGameById(gameId)
        setGame(gameData)
      } catch (error) {
        console.error("Error fetching game:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [gameId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-gray-400">Loading game...</p>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Game Not Found</h1>
        <p className="text-gray-400 mb-6">Sorry, we couldn't find the game you're looking for.</p>
        <Link href="/games" className="text-cyan-500 hover:underline">
          Browse all games
        </Link>
      </div>
    )
  }

  return <GamePlayClient game={game} />
  }
