"use client"

import { useState, useEffect } from "react"
import { GameCard } from "@/components/game-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getAllGames, Game } from "@/lib/games"
import { Component, Globe, Filter, X, Star } from "lucide-react"

export const metadata = {
  title: "Game Hub | 8BitPixel Arcade",
  description: "Browse our curated collection of pixel-perfect games at 8BitPixel Arcade.",
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [filters, setFilters] = useState({
    category: "All Categories",
    type: "All Games",
    sort: "Popular",
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  // Fetch games on component mount
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true)
      const allGames = await getAllGames()
      setGames(allGames)
      setFilteredGames(allGames)
      setLoading(false)
    }
    
    fetchGames()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    let result = [...games]
    
    // Filter by category
    if (filters.category !== "All Categories") {
      result = result.filter(game => game.category === filters.category)
    }
    
    // Filter by game type (native/external)
    if (filters.type === "Native Games") {
      result = result.filter(game => game.hasComponent === true)
    } else if (filters.type === "External Games") {
      result = result.filter(game => !game.hasComponent)
    }
    
    // Sort the games
    if (filters.sort === "Popular") {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    } else if (filters.sort === "Newest") {
      result.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0
        return dateB - dateA
      })
    } else if (filters.sort === "A-Z") {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }
    
    setFilteredGames(result)
  }, [games, filters])

  // Get unique categories from games
  const categories = ["All Categories", ...Array.from(new Set(games.map(game => game.category).filter(Boolean)))]
  // Count native vs external games
  const nativeCount = games.filter(game => game.hasComponent).length
  const externalCount = games.filter(game => !game.hasComponent).length

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4 md:mb-0">
              Game Hub
            </h1>
              {/* Mobile filter button */}
            <button 
              className="md:hidden bg-gray-900 border border-cyan-900/50 text-gray-300 px-4 py-2 rounded-md flex items-center justify-between w-full mb-4"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <span>Filters {Object.values(filters).some(val => val !== "All Categories" && val !== "All Games" && val !== "Popular") && '(Active)'}</span>
              <Filter size={18} className={filters.category !== "All Categories" || filters.type !== "All Games" ? "text-cyan-400" : ""} />
            </button>
            
            {/* Filter controls - responsive */}
            <div className={`flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 ${isFiltersOpen ? 'block' : 'hidden md:flex'}`}>
              <select 
                className={`bg-gray-900 border ${filters.category !== "All Categories" ? "border-cyan-500" : "border-cyan-900/50"} text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select 
                className={`bg-gray-900 border ${filters.type !== "All Games" ? "border-cyan-500" : "border-cyan-900/50"} text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="All Games">All Games</option>
                <option value="Native Games">Native Games ({nativeCount})</option>
                <option value="External Games">External Games ({externalCount})</option>
              </select>
              
              <select 
                className={`bg-gray-900 border ${filters.sort !== "Popular" ? "border-cyan-500" : "border-cyan-900/50"} text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                value={filters.sort}
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
              >
                <option value="Popular">Sort by: Popular</option>
                <option value="Newest">Sort by: Newest</option>
                <option value="A-Z">Sort by: A-Z</option>
              </select>
              
              {/* Reset filters button - only show if filters are active */}
              {(filters.category !== "All Categories" || filters.type !== "All Games" || filters.sort !== "Popular") && (
                <button 
                  onClick={() => setFilters({category: "All Categories", type: "All Games", sort: "Popular"})}
                  className="flex items-center justify-center px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300"
                  aria-label="Reset filters"
                >
                  <X size={16} className="mr-1" />
                  <span className="text-sm">Reset</span>
                </button>
              )}
            </div>
          </div>          {/* Game type legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
            <div className="flex-grow">
              <h2 className="text-gray-300 font-medium mb-2">Game Types:</h2>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                  <span className="text-sm text-gray-300 flex items-center">
                    <Component size={14} className="mr-1 text-cyan-400" />
                    Native Games <span className="text-gray-500 ml-1">({nativeCount})</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  <span className="text-sm text-gray-300 flex items-center">
                    <Globe size={14} className="mr-1 text-gray-400" />
                    External Games <span className="text-gray-500 ml-1">({externalCount})</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-right text-gray-500 max-w-sm">
              Native games run directly in your browser without leaving 8BitPixel Arcade. 
              External games will redirect you to partner sites.
            </div>
          </div>

          {/* Active filters display */}
          {(filters.category !== "All Categories" || filters.type !== "All Games") && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <div className="text-gray-400 text-sm mr-2">Active filters:</div>
              
              {filters.category !== "All Categories" && (
                <div className="bg-gray-800 text-cyan-400 text-xs py-1 px-2 rounded-full flex items-center">
                  <span className="mr-1">{filters.category}</span>
                  <button 
                    onClick={() => setFilters({...filters, category: "All Categories"})}
                    className="hover:bg-gray-700 rounded-full p-0.5"
                    aria-label="Remove category filter"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {filters.type !== "All Games" && (
                <div className="bg-gray-800 text-cyan-400 text-xs py-1 px-2 rounded-full flex items-center">
                  <span className="mr-1">{filters.type}</span>
                  <button 
                    onClick={() => setFilters({...filters, type: "All Games"})}
                    className="hover:bg-gray-700 rounded-full p-0.5"
                    aria-label="Remove type filter"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results info */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm">
              Found <span className="text-cyan-400 font-medium">{filteredGames.length}</span> games
              {filters.category !== "All Categories" && (
                <> in <span className="text-cyan-400 font-medium">{filters.category}</span></>
              )}
              {filters.type !== "All Games" && (
                <> ({filters.type})</>
              )}
            </p>
          </div>          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gray-900/50 rounded-xl h-[360px] animate-pulse">
                  <div className="h-48 bg-gray-800 rounded-t-xl"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6 mb-6"></div>
                    <div className="h-10 bg-gray-800 rounded mb-2"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Games grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredGames.map((game) => (
                <div key={game.id} className="relative">
                  {game.featured && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-black text-xs py-1 px-3 rounded-full flex items-center shadow-lg">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </div>
                    </div>
                  )}
                  <GameCard game={game} showViewDetails={true} />
                </div>
              ))}
              
              {filteredGames.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                    <Filter size={24} className="text-gray-400 pulse-filter" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No games found</h3>
                  <p className="text-gray-400">Try adjusting your filters to find more games</p>
                </div>
              )}
            </div>
          )}

          {/* Coming soon section */}
          <div className="border-t border-gray-800 pt-8 mt-12">
            <h2 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6">
              Coming Soon
            </h2>
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-gray-300">More Native Games</h3>
                <div className="bg-cyan-900/30 text-cyan-400 text-xs py-1 px-2 rounded-full">
                  In Development
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Our team is working on bringing more native games to the 8BitPixel Arcade platform. 
                Stay tuned for more pixel-perfect gaming experiences!
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-gray-800 text-gray-400 text-xs py-1 px-3 rounded-full">
                  Block Builder
                </div>
                <div className="bg-gray-800 text-gray-400 text-xs py-1 px-3 rounded-full">
                  Pixel Escape
                </div>
                <div className="bg-gray-800 text-gray-400 text-xs py-1 px-3 rounded-full">
                  Neon Racer
                </div>
                <div className="bg-gray-800 text-gray-400 text-xs py-1 px-3 rounded-full">
                  Crypto Quest
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
