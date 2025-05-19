import { GameCard } from "@/components/game-card"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { getFeaturedGames } from "@/lib/games"
import Link from "next/link"

export default async function HomePage() {
  const games = await getFeaturedGames()

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <section id="games" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h2 className="text-4xl font-bold mb-3 font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Featured Games
              </h2>
              <p className="text-gray-400 max-w-2xl text-lg">
                Explore our curated collection of pixel-perfect games, each offering unique challenges and immersive experiences.
              </p>
            </div>
            <Link 
              href="/games"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 hover:from-cyan-800/50 hover:to-blue-800/50 border border-cyan-900/50 text-base font-medium rounded-md text-white transition-all duration-300 self-center md:self-auto"
            >
              View All Games
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
