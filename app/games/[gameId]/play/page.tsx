import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import GamePlayClient from "@/components/game-play-client"
import { getAllGames, getGameById } from "@/lib/games"

export async function generateStaticParams() {
  const games = await getAllGames()
  
  return games.filter(game => game.hasComponent).map((game) => ({
    gameId: game.id,
  }))
}

export async function generateMetadata({ params }: { params: { gameId: string } }): Promise<Metadata> {
  const game = await getGameById(params.gameId)
  
  if (!game) {
    return {
      title: "Game Not Found | 8BitPixel Arcade",
      description: "The requested game could not be found.",
    }
  }
  
  return {
    title: `Play ${game.title} | 8BitPixel Arcade`,
    description: `Play ${game.title} - ${game.description}`,
  }
}

interface GamePlayPageProps {
  params: {
    gameId: string
  }
}

export default async function GamePlayPage({ params }: GamePlayPageProps) {
  const game = await getGameById(params.gameId)
  
  if (!game || !game.hasComponent) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
            {game.title}
          </h1>
          
          <div className="rounded-lg overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950">
            <GamePlayClient gameId={game.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
