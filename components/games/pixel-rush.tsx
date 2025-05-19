"use client"

import { useState, useEffect, useRef } from 'react'

export function PixelRushGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [playerPosition, setPlayerPosition] = useState(2) // Position on a scale of 0-4 (5 lanes)
  const [obstacles, setObstacles] = useState<{lane: number, y: number, type: string, collected: boolean}[]>([])
  const [showRules, setShowRules] = useState(true)
  const [speed, setSpeed] = useState(5) // Game speed
  
  const gameRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)
  
  // Game items and their properties
  const items = {
    obstacle: { emoji: '🌵', points: 0 }, 
    coin: { emoji: '⭐', points: 10 },
    powerup: { emoji: '🌟', points: 25 },
    danger: { emoji: '🔥', points: 0 }
  }
  
  // Initialize game
  useEffect(() => {
    // Reset state when starting a new game
    if (gameStarted && !gameOver) {
      setPlayerPosition(2)
      setObstacles([])
      setScore(0)
      setSpeed(5)
      startGameLoop()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameStarted, gameOver])
  
  // Game loop
  const startGameLoop = () => {
    lastFrameTimeRef.current = performance.now()
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current
      lastFrameTimeRef.current = currentTime
      
      // Handle obstacle movement and collision detection
      updateGameState(deltaTime)
      
      // Continue loop if game is still active
      if (gameStarted && !gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop)
      }
    }
    
    // Start the loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }
  
  // Update game state every frame
  const updateGameState = (deltaTime: number) => {
    // Move obstacles down
    const updatedObstacles = obstacles.map(obstacle => ({
      ...obstacle,
      y: obstacle.y + speed * (deltaTime / 100)
    }))
    
    // Add new obstacles occasionally
    if (Math.random() < 0.03) {
      const lane = Math.floor(Math.random() * 5)
      const type = Math.random() < 0.7 ? 'obstacle' : 
                  Math.random() < 0.85 ? 'coin' : 
                  Math.random() < 0.95 ? 'powerup' : 'danger'
      
      updatedObstacles.push({
        lane,
        y: -10, // Start above the visible area
        type,
        collected: false
      })
    }
    
    // Check for collisions and remove offscreen obstacles
    const playerLane = playerPosition
    const newObstacles = []
    let scoreIncrement = 0
    let hitObstacle = false
    
    for (const obstacle of updatedObstacles) {
      // Obstacles in the visible game area
      if (obstacle.y < 100) {
        // Check for collision with player
        if (obstacle.y > 75 && obstacle.y < 95 && obstacle.lane === playerLane && !obstacle.collected) {
          // Handle different types of collisions
          if (obstacle.type === 'obstacle' || obstacle.type === 'danger') {
            hitObstacle = true
          } else {
            // Collect coins and powerups
            obstacle.collected = true
            scoreIncrement += items[obstacle.type as keyof typeof items].points
            
            // If powerup, increase speed slightly
            if (obstacle.type === 'powerup') {
              setSpeed(prev => Math.min(prev + 0.5, 12))
            }
          }
        }
        
        if (!obstacle.collected) {
          newObstacles.push(obstacle)
        }
      }
    }
    
    // Update score
    if (scoreIncrement > 0) {
      setScore(prev => prev + scoreIncrement)
    }
    
    // End game if obstacle hit
    if (hitObstacle) {
      endGame()
    } else {
      setObstacles(newObstacles)
    }
  }
  
  // End game and update high score if needed
  const endGame = () => {
    setGameOver(true)
    setHighScore(prev => Math.max(prev, score))
  }
  
  // Handle controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!gameStarted || gameOver) return
    
    switch (e.key) {
      case 'ArrowLeft':
        setPlayerPosition(prev => Math.max(0, prev - 1))
        break
      case 'ArrowRight':
        setPlayerPosition(prev => Math.min(4, prev + 1))
        break
    }
  }
  
  // Move player left or right
  const movePlayer = (direction: 'left' | 'right') => {
    if (!gameStarted || gameOver) return
    
    if (direction === 'left') {
      setPlayerPosition(prev => Math.max(0, prev - 1))
    } else {
      setPlayerPosition(prev => Math.min(4, prev + 1))
    }
  }
  
  // Start new game
  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setShowRules(false)
  }
  
  // Game instructions
  const renderRules = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">Pixel Rush</h2>
      <p className="mb-6 text-center">Race against time in this fast-paced pixel adventure. Avoid obstacles and collect power-ups!</p>
      
      <button
        onClick={startGame}
        className="w-full py-3 px-6 mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
      >
        Start Game
      </button>
      
      <div className="space-y-4 text-sm">
        <h3 className="font-bold">How To Play:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use left and right arrow keys or buttons to move your character</li>
          <li>Avoid obstacles (🌵) and danger (🔥)</li>
          <li>Collect stars (⭐) for points</li>
          <li>Collect power-ups (🌟) for bonus points and speed boost</li>
          <li>Game ends when you hit an obstacle</li>
        </ul>
        
        <div className="mt-4 bg-black/20 p-4 rounded-lg">
          <h4 className="font-bold mb-2">Game Items:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <div className="text-2xl">🌵</div>
              <div className="text-xs">Obstacle<br/>(Avoid)</div>
            </div>
            <div className="bg-white/10 p-2 rounded-lg">
              <div className="text-2xl">🔥</div>
              <div className="text-xs">Danger<br/>(Avoid)</div>
            </div>
            <div className="bg-yellow-500/30 p-2 rounded-lg">
              <div className="text-2xl">⭐</div>
              <div className="text-xs">Star<br/>(10 Points)</div>
            </div>
            <div className="bg-yellow-500/30 p-2 rounded-lg">
              <div className="text-2xl">🌟</div>
              <div className="text-xs">Power-Up<br/>(25 Points)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div 
      className="w-full h-full min-h-[600px] bg-gradient-to-br from-cyan-900 to-indigo-900 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={gameRef}
    >
      {!gameStarted ? (
        // Show game rules and start screen before game starts
        renderRules()
      ) : (
        <>
          {/* Game UI */}
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg min-w-[100px]">
              <div className="text-gray-300 text-xs mb-1">Score</div>
              <div className="text-white font-bold text-xl">{score}</div>
            </div>
            
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="text-gray-300 text-xs mb-1">High Score</div>
              <div className="text-white font-bold text-xl">{highScore}</div>
            </div>
          </div>
          
          {/* Game area */}
          <div className="relative bg-gray-900/70 border border-gray-800 rounded-lg w-full max-w-md h-96">
            {/* Game over message */}
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm rounded-lg">
                <div className="text-center p-6 bg-gray-800/80 rounded-lg">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">Game Over!</h3>
                  <p className="text-white mb-4">Final Score: {score}</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGame}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-md"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => setShowRules(true)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    >
                      How to Play
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Game elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Background with scrolling effect */}
              <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
              
              {/* Lane dividers */}
              {Array.from({length: 6}).map((_, i) => (
                <div 
                  key={`lane-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-gray-700/50"
                  style={{left: `${(i * 20)}%`}}
                />
              ))}
              
              {/* Player character */}
              <div 
                className="absolute bottom-4 w-16 h-16 flex items-center justify-center transition-all duration-200"
                style={{
                  left: `${playerPosition * 20}%`,
                  marginLeft: '-2rem',
                }}
              >
                <div className="text-3xl animate-bounce">🏃</div>
              </div>
              
              {/* Obstacles and collectibles */}
              {obstacles.map((obstacle, index) => (
                <div 
                  key={`obstacle-${index}`}
                  className="absolute w-12 h-12 flex items-center justify-center transition-all"
                  style={{
                    left: `${obstacle.lane * 20}%`,
                    top: `${obstacle.y}%`,
                    marginLeft: '-1.5rem',
                  }}
                >
                  <div className={`text-2xl ${obstacle.type === 'powerup' ? 'animate-pulse' : ''}`}>
                    {items[obstacle.type as keyof typeof items].emoji}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Game controls for touch screens */}
          <div className="mt-4 flex justify-between w-full max-w-md">
            <button
              onClick={() => movePlayer('left')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-xl rounded-lg"
            >
              ⬅️
            </button>
            
            <button
              onClick={() => movePlayer('right')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-xl rounded-lg"
            >
              ➡️
            </button>
          </div>
          
          {showRules && (
            <div className="mt-4 p-4 w-full max-w-md bg-black/50 backdrop-blur-sm rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Game Instructions</h3>
                <button 
                  onClick={() => setShowRules(false)}
                  className="text-white/70 hover:text-white"
                >
                  Hide
                </button>
              </div>
              <p className="text-white/80 text-sm">
                Avoid obstacles (🌵, 🔥) and collect stars (⭐, 🌟) for points. 
                Use arrow keys or the buttons below to move left and right.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
