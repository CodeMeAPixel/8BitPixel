"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Gamepad2 } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-md shadow-md border-b border-cyan-900/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Gamepad2 className="h-6 w-6 mr-2 text-cyan-400" />
              <span className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                8BitPixel Arcade
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#games" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
              Games
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
              About
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="#games"
              className="block px-3 py-2 text-gray-300 hover:text-white font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Games
            </Link>
            <Link
              href="#about"
              className="block px-3 py-2 text-gray-300 hover:text-white font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
