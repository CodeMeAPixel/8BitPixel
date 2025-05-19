"use client"

import { useState, useEffect, useRef } from 'react'

export function CatMazesGame() {
  const [level, setLevel] = useState(1)
  const [moves, setMoves] = useState(0)
  const [grid, setGrid] = useState<string[][]>([])
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 })
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 })
  const [gameWon, setGameWon] = useState(false)
  const [treats, setTreats] = useState(0)
  const [totalTreats, setTotalTreats] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{x: number, y: number} | null>(null)
  
  // Generate maze when level changes
  useEffect(() => {
    if (gameStarted) {
      generateMaze()
    }
  }, [level, gameStarted])
  
  // Set up touch controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      }
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return
      
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      }
      
      const deltaX = touchEnd.x - touchStartRef.current.x
      const deltaY = touchEnd.y - touchStartRef.current.y
      
      // Determine if the swipe was horizontal or vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 30) {
          movePlayer(1, 0) // Right
        } else if (deltaX < -30) {
          movePlayer(-1, 0) // Left
        }
      } else {
        // Vertical swipe
        if (deltaY > 30) {
          movePlayer(0, 1) // Down
        } else if (deltaY < -30) {
          movePlayer(0, -1) // Up
        }
      }
      
      touchStartRef.current = null
    }
    
    const container = gameContainerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart)
      container.addEventListener('touchend', handleTouchEnd)
    }
    
    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [gameStarted])
  
  const startGame = () => {
    setGameStarted(true)
    setShowInstructions(false)
    setLevel(1)
    setTreats(0)
    setTotalTreats(0)
    generateMaze()
  }
  
  // Use a more sophisticated maze generation algorithm
  const generateMaze = () => {
    const size = 8 + Math.min(level, 4) // Maze grows with levels, max 12x12
    
    // Create empty grid filled with walls
    const newGrid: string[][] = Array(size).fill(0).map(() => Array(size).fill('🧱'))
    
    // Use a simplified version of Prim's algorithm for maze generation
    
    // Start with a grid full of walls
    let startX = Math.floor(Math.random() * (size-2)) + 1
    let startY = Math.floor(Math.random() * (size-2)) + 1
    
    // Mark the starting cell as a passage
    newGrid[startY][startX] = '⬜'
    
    // List of walls to consider
    const walls = [
      {x: startX+1, y: startY},
      {x: startX-1, y: startY},
      {x: startX, y: startY+1},
      {x: startX, y: startY-1}
    ].filter(w => w.x > 0 && w.x < size-1 && w.y > 0 && w.y < size-1)
    
    // While there are walls in the list
    while (walls.length > 0) {
      // Pick a random wall
      const randomIndex = Math.floor(Math.random() * walls.length)
      const wall = walls[randomIndex]
      walls.splice(randomIndex, 1)
      
      // Count passages around this wall
      let passages = 0
      const directions = [
        {dx: 1, dy: 0},
        {dx: -1, dy: 0},
        {dx: 0, dy: 1},
        {dx: 0, dy: -1}
      ]
      
      directions.forEach(dir => {
        const nx = wall.x + dir.dx
        const ny = wall.y + dir.dy
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && newGrid[ny][nx] === '⬜') {
          passages++
        }
      })
      
      // If one passage found, make it a passage
      if (passages === 1) {
        newGrid[wall.y][wall.x] = '⬜'
        
        // Add neighboring walls
        directions.forEach(dir => {
          const nx = wall.x + dir.dx
          const ny = wall.y + dir.dy
          if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && newGrid[ny][nx] === '🧱') {
            walls.push({x: nx, y: ny})
          }
        })
      }
    }
    
    // Place player at a random empty spot
    let playerX, playerY
    do {
      playerX = Math.floor(Math.random() * size)
      playerY = Math.floor(Math.random() * size)
    } while (newGrid[playerY][playerX] !== '⬜')
    
    newGrid[playerY][playerX] = '😺'
    setPlayerPosition({ x: playerX, y: playerY })
    
    // Place exit far from the player
    let exitX, exitY
    let maxDistance = 0
    
    // Try several positions and pick the one furthest from the player
    for (let i = 0; i < 20; i++) {
      let testX, testY
      do {
        testX = Math.floor(Math.random() * size)
        testY = Math.floor(Math.random() * size)
      } while (newGrid[testY][testX] !== '⬜')
      
      const distance = Math.abs(testX - playerX) + Math.abs(testY - playerY)
      if (distance > maxDistance) {
        maxDistance = distance
        exitX = testX
        exitY = testY
      }
    }
    
    newGrid[exitY!][exitX!] = '🚪'
    setExitPosition({ x: exitX!, y: exitY! })
    
    // Add treats
    const treatCount = 3 + Math.floor(level / 2)
    let treatsPlaced = 0
    let attempts = 0
    setTotalTreats(treatCount)
    
    while (treatsPlaced < treatCount && attempts < 100) {
      attempts++
      const treatX = Math.floor(Math.random() * size)
      const treatY = Math.floor(Math.random() * size)
      
      // Don't place on player, exit or wall
      if (newGrid[treatY][treatX] === '⬜') {
        newGrid[treatY][treatX] = '🐟'
        treatsPlaced++
      }
    }
    
    setGrid(newGrid)
    setMoves(0)
    setGameWon(false)
    setTreats(0)
  }
  
  const movePlayer = (dx: number, dy: number) => {
    if (gameWon) return
    
    const newX = playerPosition.x + dx
    const newY = playerPosition.y + dy
    
    // Check if move is valid (within bounds and not a wall)
    if (
      newX >= 0 && newX < grid[0].length &&
      newY >= 0 && newY < grid.length &&
      grid[newY][newX] !== '🧱'
    ) {
      const newGrid = [...grid.map(row => [...row])]
      
      // Replace old position with empty space
      newGrid[playerPosition.y][playerPosition.x] = '⬜'
      
      // Check if we're moving to a treat
      if (newGrid[newY][newX] === '🐟') {
        setTreats(prev => prev + 1)
      }
      
      // Check if we're moving to exit
      if (newX === exitPosition.x && newY === exitPosition.y) {
        // Calculate bonus based on efficiency and treat collection
        const movesBonus = Math.max(0, 100 - moves) // Fewer moves = higher bonus
        const treatsBonus = treats * 50 // Each treat is worth 50 points
        const levelBonus = level * 100 // Level bonus
        const totalBonus = movesBonus + treatsBonus + levelBonus
        
        setGameWon(true)
        setTimeout(() => {
          setLevel(level + 1)
        }, 2000)
      }
      
      // Update player position
      setPlayerPosition({ x: newX, y: newY })
      
      // Update grid
      newGrid[newY][newX] = '😺'
      setGrid(newGrid)
      
      // Increment moves
      setMoves(moves + 1)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!gameStarted) return
    
    switch (e.key) {
      case 'ArrowUp':
        movePlayer(0, -1)
        break
      case 'ArrowDown':
        movePlayer(0, 1)
        break
      case 'ArrowLeft':
        movePlayer(-1, 0)
        break
      case 'ArrowRight':
        movePlayer(1, 0)
        break
    }
  }
  
  // Render welcome screen
  const renderWelcome = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-900/80 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Cat Mazes
        </h2>
        
        <p className="mb-6 text-center">
          Help the cat find its way through increasingly difficult mazes!
        </p>
        
        <div className="space-y-4 mb-6">
          <p className="font-medium">How to play:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Use arrow keys or swipe to move the cat</li>
            <li>Collect fish treats for extra points</li>
            <li>Find the door to exit each level</li>
            <li>The mazes get bigger and more complex as you progress</li>
          </ul>
        </div>
        
        <button
          onClick={startGame}
          className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300"
        >
          Start Game
        </button>
      </div>
    </div>
  )
  
  return (
    <div 
      ref={gameContainerRef}
      className="w-full h-full min-h-[600px] bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg overflow-hidden flex flex-col items-center p-4 relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {!gameStarted && renderWelcome()}
      
      {gameStarted && (
        <>
          <div className="w-full flex justify-between items-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <span className="font-bold">Level {level}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <span className="font-bold">Moves: {moves}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <span className="font-bold">Treats: {treats}/{totalTreats}</span>
            </div>
          </div>
          
          {gameWon && (
            <div className="mb-4 bg-white/30 backdrop-blur-sm rounded-lg p-3 text-white text-center">
              Level Complete! 🎉 Moving to level {level + 1}...
            </div>
          )}
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 w-full max-w-md overflow-auto">
            <div className="grid gap-1" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${grid[0]?.length || 10}, minmax(0, 1fr))`,
            }}>
              {grid.map((row, y) => (
                row.map((cell, x) => (
                  <div 
                    key={`${x}-${y}`} 
                    className={`w-8 h-8 flex items-center justify-center text-lg ${
                      (playerPosition.x === x && playerPosition.y === y) ? 'animate-pulse' :
                      (exitPosition.x === x && exitPosition.y === y) ? 'animate-bounce' :
                      cell === '🐟' ? 'animate-pulse' : ''
                    }`}
                  >
                    {cell}
                  </div>
                ))
              ))}
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-2 w-48">
            <div></div>
            <button 
              className="bg-white/20 hover:bg-white/40 active:bg-white/50 rounded-lg p-4 text-white" 
              onClick={() => movePlayer(0, -1)}
            >
              ▲
            </button>
            <div></div>
            <button 
              className="bg-white/20 hover:bg-white/40 active:bg-white/50 rounded-lg p-4 text-white" 
              onClick={() => movePlayer(-1, 0)}
            >
              ◀
            </button>
            <div className="flex items-center justify-center text-white/50 text-xs">
              SWIPE
            </div>
            <button 
              className="bg-white/20 hover:bg-white/40 active:bg-white/50 rounded-lg p-4 text-white" 
              onClick={() => movePlayer(1, 0)}
            >
              ▶
            </button>
            <div></div>
            <button 
              className="bg-white/20 hover:bg-white/40 active:bg-white/50 rounded-lg p-4 text-white" 
              onClick={() => movePlayer(0, 1)}
            >
              ▼
            </button>
            <div></div>
          </div>
          
          <button
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/40 rounded-lg text-white text-sm"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? "Hide" : "Show"} Instructions
          </button>
          
          {showInstructions && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md text-white text-sm">
              <p className="mb-2"><strong>Controls:</strong></p>
              <ul className="pl-4">
                <li>• Use arrow keys or swipe to move</li>
                <li>• Collect all 🐟 treats if you can</li>
                <li>• Reach the 🚪 to complete the level</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
