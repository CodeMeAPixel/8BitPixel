import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getGameById, getAllGames } from "@/lib/games"
import { Gamepad2, ArrowLeft, Clock, Tag, ExternalLink } from "lucide-react"
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

  // Generate tags based on game title for demo purposes
  const generateTags = (title: string) => {
    const baseTags = ["Pixel Art", "Browser Game"]
    if (title.toLowerCase().includes("word")) return [...baseTags, "Word", "Puzzle"]
    if (title.toLowerCase().includes("emoji")) return [...baseTags, "Casual", "Strategy"]
    if (title.toLowerCase().includes("cat")) return [...baseTags, "Animals", "Maze"]
    if (title.toLowerCase().includes("ice")) return [...baseTags, "Logic", "Seasonal"]
    return [...baseTags, "Adventure"]
  }

  const tags = generateTags(game.title)

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link 
              href="/games" 
              className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">              <div className="bg-gray-900/90 rounded-xl overflow-hidden border border-gray-800 pixel-border">
                <div className="relative aspect-video">
                  <GameImage gameId={game.id} gameTitle={game.title} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-900/90 rounded-xl border border-gray-800 p-6 h-full flex flex-col">
                <h1 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                  {game.title}
                </h1>
                <p className="text-gray-300 mb-4">{game.shortDescription}</p>
                <p className="text-gray-400 mb-6">{game.description}</p>
                
                <div className="flex items-center mb-4">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-400 text-sm">Playtime: ~5-15 minutes</span>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map((tag) => (
                      <div key={tag} className="px-3 py-1 text-xs rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-900/50">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
                  <div className="mt-auto flex space-x-4">                  <Link
                    href={`/games/${game.id}/play`}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-cyan-900/50 text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-1 active:translate-y-0"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" /> Play Now
                  </Link>
                  
                  <Link
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-700 text-base font-medium rounded-md text-gray-300 hover:text-white hover:border-cyan-900/50 transition-all duration-300"
                    title="Visit original game"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
              Game Information
            </h2>
            <div className="bg-gray-900/90 rounded-xl border border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
                  <p className="text-gray-400 mb-4">
                    {game.title} is easy to learn but offers deep strategic gameplay. Use your mouse to interact with
                    the game elements, solve puzzles, and progress through the levels.
                  </p>
                  <p className="text-gray-400">
                    Each level presents new challenges, requiring both quick thinking and careful planning.
                    See if you can master all the levels and unlock special achievements!
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Features</h3>
                  <ul className="text-gray-400 space-y-2">
                    <li className="flex items-start">
                      <div className="text-cyan-400 mr-2">•</div>
                      <div>Multiple challenging levels</div>
                    </li>
                    <li className="flex items-start">
                      <div className="text-cyan-400 mr-2">•</div>
                      <div>Beautiful pixel art graphics</div>
                    </li>
                    <li className="flex items-start">
                      <div className="text-cyan-400 mr-2">•</div>
                      <div>Original soundtrack</div>
                    </li>
                    <li className="flex items-start">
                      <div className="text-cyan-400 mr-2">•</div>
                      <div>Special achievements to unlock</div>
                    </li>
                    <li className="flex items-start">
                      <div className="text-cyan-400 mr-2">•</div>
                      <div>Save your progress</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
