"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Game } from '@/lib/games'
import { GameId } from '@/components/games'

// Dynamically import game components to reduce initial bundle size
const gameComponentMap = {
  wordisles: dynamic(() => import('@/components/games/word-isles').then(mod => ({ default: mod.WordIslesGame }))),
  emojigrid: dynamic(() => import('@/components/games/emoji-grid').then(mod => ({ default: mod.EmojiGridGame }))),
  catmazes: dynamic(() => import('@/components/games/cat-mazes').then(mod => ({ default: mod.CatMazesGame }))),
  breaktheice: dynamic(() => import('@/components/games/break-the-ice').then(mod => ({ default: mod.BreakTheIceGame }))),
  pixelrush: dynamic(() => import('@/components/games/pixel-rush').then(mod => ({ default: mod.PixelRushGame }))),
  cyberpong: dynamic(() => import('@/components/games/cyberpong').then(mod => ({ default: mod.CyberPongGame }))),
}

interface GameLoaderProps {
  gameId: GameId
  height?: string
}

export function GameLoader({ gameId, height = '600px' }: GameLoaderProps) {
  // Get the correct component for this game
  const GameComponent = gameComponentMap[gameId as keyof typeof gameComponentMap]
  
  if (!GameComponent) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-gray-900 rounded-xl p-8 text-center">
        <div className="text-gray-400">
          <h3 className="text-xl font-medium mb-2">Game Not Available</h3>
          <p>This game is still in development and will be available soon!</p>
        </div>
      </div>
    )
  }
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 font-medium">Loading game...</p>
        </div>
      </div>
    }>
      <div style={{ height: height === 'full' ? '100%' : height }}>
        <GameComponent />
      </div>
    </Suspense>
  )
}
