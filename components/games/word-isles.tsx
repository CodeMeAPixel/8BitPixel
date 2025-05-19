"use client"

import { useState, useEffect } from 'react'

export function WordIslesGame() {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    words: [],
    currentWord: '',
    isles: []
  })

  // Game initialization logic
  useEffect(() => {
    // Initialize game state
    const initGame = () => {
      setGameState({
        score: 0,
        level: 1,
        words: ['BRIDGE', 'ISLAND', 'FLOAT', 'JOURNEY', 'CROSS'],
        currentWord: 'BRIDGE',
        isles: generateIslands(6)
      })
    }

    initGame()
  }, [])

  // Generate island positions
  const generateIslands = (count: number) => {
    const islands = []
    for (let i = 0; i < count; i++) {
      islands.push({
        id: i,
        x: Math.random() * 80 + 10, // 10-90% of width
        y: Math.random() * 80 + 10, // 10-90% of height
        size: Math.random() * 20 + 20, // 20-40px
      })
    }
    return islands
  }

  // Handle letter selection
  const handleIslandClick = (id: number) => {
    // Game logic would go here
    setGameState(prev => ({
      ...prev,
      score: prev.score + 10
    }))
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-b from-blue-800 to-blue-500 rounded-lg overflow-hidden relative">
      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white font-semibold">
        Score: {gameState.score} | Level: {gameState.level}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 mx-auto w-4/5 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
        <p className="text-white font-bold text-lg">Current Word: {gameState.currentWord}</p>
        <p className="text-white/80 text-sm">Click on islands to form word bridges</p>
      </div>
      
      {/* Islands */}
      {gameState.isles.map(isle => (
        <div 
          key={isle.id}
          onClick={() => handleIslandClick(isle.id)}
          style={{
            position: 'absolute',
            left: `${isle.x}%`,
            top: `${isle.y}%`,
            width: `${isle.size}px`,
            height: `${isle.size}px`,
            backgroundColor: '#8db600',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <span className="text-white font-bold">
            {String.fromCharCode(65 + isle.id % 26)}
          </span>
        </div>
      ))}
      
      {/* Bridges would be drawn here in a full implementation */}
    </div>
  )
}
