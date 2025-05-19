import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Gamepad2, Home, Search } from "lucide-react"

export default function GameNotFound() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Gamepad2 className="w-20 h-20 mx-auto text-gray-600 mb-4" />
          </div>
          <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
            Game Not Found
          </h1>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Sorry, we couldn't find the game you're looking for. It might have been removed or the URL may be incorrect.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/games"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-base font-medium rounded-md text-white transition-all duration-300 w-full sm:w-auto"
            >
              <Search className="w-5 h-5 mr-2" /> Browse All Games
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-cyan-900/50 text-base font-medium rounded-md text-gray-300 hover:text-white hover:border-cyan-800 transition-all duration-300 w-full sm:w-auto"
            >
              <Home className="w-5 h-5 mr-2" /> Return to Home
            </Link>
          </div>
          
          <div className="mt-12">
            <div className="inline-block w-32 h-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-full"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
