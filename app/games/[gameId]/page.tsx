import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { GameInfoSection } from "@/components/game-info-section"
import { getGameById, getAllGames } from "@/lib/games"
import { Play, Calendar, Tag } from "lucide-react"
import { GameImage } from "@/components/game-image"

export async function generateStaticParams() {
  const games = await getAllGames()
  
  return games.map((game) => ({
    gameId: game.id,
  }))
}

export async function generateMetadata({ params }: { params: { gameId: string } }) {
  const game = await getGameById(params.gameId)
  
  if (!game) {
    return {
      title: "Game Not Found | 8BitPixel Arcade",
      description: "The requested game could not be found.",
    }
  }
  
  return {
    title: `${game.title} | 8BitPixel Arcade`,
    description: game.description,
  }
}

export default async function GamePage({ params }: { params: { gameId: string } }) {
  const game = await getGameById(params.gameId)
  
  if (!game) {
    notFound()
  }

  // Generate tags based on game properties
  const tags = [game.category]
  if (game.hasComponent) tags.push("Native")
  if (game.usesGameEngine) tags.push("8BitGE")

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Game Details */}
              <div className="md:col-span-2">
                <div className="flex flex-col h-full">
                  <h1 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                    {game.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-900/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-gray-300 mb-6">{game.data?.longDescription || game.description}</p>
                  
                  <div className="flex gap-4 mb-6">
                    <Link href={`/games/${game.id}/play`}>
                      <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/20 transition-all">
                        <Play size={16} className="mr-2" />
                        Play Game
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-400 mb-6">
                    {game.dateAdded && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Added: {new Date(game.dateAdded).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>Category: {game.category}</span>
                    </div>
                  </div>
                  
                  {/* Game screenshot or preview */}
                  <div className="rounded-lg overflow-hidden border border-gray-800 mb-8">
                    <div className="aspect-video relative">
                      <GameImage gameId={game.id} gameTitle={game.title} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Information and Rules */}
              <div>
                <GameInfoSection gameData={game.data} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
