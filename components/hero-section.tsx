"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToGames = () => {
    document.getElementById("games")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative overflow-hidden bg-background min-h-[70vh] flex items-center">
      {/* Animated background grid */}
      <div className="absolute inset-0 z-0 arcade-grid opacity-30"></div>

      {/* Pre-defined particles with fixed positions to avoid hydration errors */}
      <div className="absolute inset-0 z-0">
        {/* Generate particles with fixed values instead of calculating them on the fly */}
        <div key="p1" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "6px", height: "8px", left: "5%", top: "10%", animationDelay: "0.1s", animationDuration: "3s" }} />
        <div key="p2" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "8px", height: "10px", left: "15%", top: "20%", animationDelay: "0.3s", animationDuration: "4s" }} />
        <div key="p3" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "10px", height: "7px", left: "25%", top: "40%", animationDelay: "0.5s", animationDuration: "3.5s" }} />
        <div key="p4" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "7px", height: "9px", left: "35%", top: "70%", animationDelay: "0.7s", animationDuration: "5s" }} />
        <div key="p5" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "9px", height: "6px", left: "45%", top: "15%", animationDelay: "0.9s", animationDuration: "4.5s" }} />
        <div key="p6" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "11px", height: "8px", left: "55%", top: "35%", animationDelay: "1.1s", animationDuration: "3.8s" }} />
        <div key="p7" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "8px", height: "12px", left: "65%", top: "55%", animationDelay: "1.3s", animationDuration: "4.2s" }} />
        <div key="p8" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "10px", height: "10px", left: "75%", top: "75%", animationDelay: "1.5s", animationDuration: "3.3s" }} />
        <div key="p9" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "6px", height: "7px", left: "85%", top: "90%", animationDelay: "1.7s", animationDuration: "5.2s" }} />
        <div key="p10" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "9px", height: "11px", left: "95%", top: "30%", animationDelay: "1.9s", animationDuration: "4.7s" }} />
        <div key="p11" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "7px", height: "8px", left: "10%", top: "60%", animationDelay: "2.1s", animationDuration: "3.9s" }} />
        <div key="p12" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "12px", height: "9px", left: "20%", top: "80%", animationDelay: "2.3s", animationDuration: "4.3s" }} />
        <div key="p13" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "8px", height: "6px", left: "30%", top: "25%", animationDelay: "2.5s", animationDuration: "5.5s" }} />
        <div key="p14" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "9px", height: "11px", left: "40%", top: "45%", animationDelay: "2.7s", animationDuration: "4.4s" }} />
        <div key="p15" className="absolute rounded-full bg-cyan-500/20 animate-float" style={{ width: "11px", height: "7px", left: "50%", top: "65%", animationDelay: "2.9s", animationDuration: "3.7s" }} />
      </div>

      {/* Pixel animation background */}
      <div className="absolute inset-0 z-0 pixel-bg"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div
          className={`text-center transition-all duration-1000 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 font-display glow-text">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
              Welcome to 8BitPixel Arcade
            </span>
          </h1>
          <p className="max-w-lg mx-auto text-xl text-gray-300 sm:max-w-3xl font-medium mt-4">
            Where Nostalgia Meets Modern Gaming
          </p>
          <p className="max-w-lg mx-auto text-md text-gray-400 sm:max-w-3xl mt-2">
            Curated collection of pixel-perfect entertainment for all gamers
          </p>
          <div className="mt-6">
            <span className="pixel-title text-sm text-cyan-400">Press Start to Play</span>
          </div>

          {/* Bouncing down arrow */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={scrollToGames}
              className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 focus:outline-none"
              aria-label="Scroll to games"
            >
              <ChevronDown size={36} className="animate-bounce" />
            </button>
          </div>
        </div>
      </div>

      {/* Glowing orb effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full filter blur-3xl opacity-30"></div>
      
      {/* Pixel art decorative elements */}
      <div className="absolute bottom-10 left-10 w-16 h-16 border-4 border-cyan-500/30 rounded-lg animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-20 right-20 w-12 h-12 border-4 border-blue-500/30 rounded-lg animate-float" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute top-40 left-20 w-8 h-8 border-4 border-indigo-500/30 rounded-lg animate-float" style={{ animationDelay: '0.8s' }}></div>
    </div>
  )
}
