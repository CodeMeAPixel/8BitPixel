"use client"

import { useState, useEffect } from 'react'

export function CatMazesGame() {
  const [level, setLevel] = useState(1)
  const [moves, setMoves] = useState(0)
  const [grid, setGrid] = useState<string[][]>([])
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 })
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 })
  const [gameWon, setGameWon] = useState(false)
  
  // Generate maze
  useEffect(() => {
    generateMaze()
  }, [level])
  
  const generateMaze = () => {
    const size = 8 + Math.min(level, 5) // Maze grows with levels
    
    // Create empty grid
    const newGrid: string[][] = []
    for (let y = 0; y < size; y++) {
      const row: string[] = []
      for (let x = 0; x < size; x++) {
        // Add walls with some probability
        const isWall = Math.random() < 0.3
        row.push(isWall ? '🧱' : '⬜')
      }
      newGrid.push(row)
    }
    
    // Place player at top left(ish)
    const playerX = Math.floor(Math.random() * 2)
    const playerY = Math.floor(Math.random() * 2)
    newGrid[playerY][playerX] = '😺'
    setPlayerPosition({ x: playerX, y: playerY })
    
    // Place exit at bottom right(ish)
    const exitX = size - 1 - Math.floor(Math.random() * 2)
    const exitY = size - 1 - Math.floor(Math.random() * 2)
    newGrid[exitY][exitX] = '🚪'
    setExitPosition({ x: exitX, y: exitY })
    
    // Add some treats
    const treatCount = 3 + level
    for (let i = 0; i < treatCount; i++) {
      const treatX = Math.floor(Math.random() * size)
      const treatY = Math.floor(Math.random() * size)
      
      // Don't place on player, exit or wall
      if (newGrid[treatY][treatX] === '⬜') {
        newGrid[treatY][treatX] = '🐟'
      }
    }
    
    setGrid(newGrid)
    setMoves(0)
    setGameWon(false)
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
      const newGrid = [...grid]
      
      // Replace old position with empty space
      newGrid[playerPosition.y][playerPosition.x] = '⬜'
      
      // Check if we're moving to exit
      if (newX === exitPosition.x && newY === exitPosition.y) {
        setGameWon(true)
        setTimeout(() => {
          setLevel(level + 1)
        }, 1500)
      }
      
      // Update new position
      setPlayerPosition({ x: newX, y: newY })
      
      // Update grid
      newGrid[newY][newX] = '😺'
      setGrid(newGrid)
      
      // Increment moves
      setMoves(moves + 1)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  
  return (
    <div 
      className="w-full h-full min-h-[600px] bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg overflow-hidden flex flex-col items-center p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <div className="text-white font-bold text-xl">Level: {level}</div>
        <div className="text-white font-bold">Moves: {moves}</div>
      </div>
      
      {gameWon && (
        <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
          Level Complete! Loading next maze...
        </div>
      )}
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 w-full max-w-md">
        <div className="grid grid-cols-10 gap-1">
          {grid.map((row, y) => (
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`} 
                className="w-8 h-8 flex items-center justify-center text-lg"
              >
                {cell}
              </div>
            ))
          ))}
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-2 w-32">
        <div></div>
        <button 
          className="bg-white/20 hover:bg-white/30 rounded-lg p-2 text-white" 
          onClick={() => movePlayer(0, -1)}
        >
          ▲
        </button>
        <div></div>
        <button 
          className="bg-white/20 hover:bg-white/30 rounded-lg p-2 text-white" 
          onClick={() => movePlayer(-1, 0)}
        >
          ◀
        </button>
        <div></div>
        <button 
          className="bg-white/20 hover:bg-white/30 rounded-lg p-2 text-white" 
          onClick={() => movePlayer(1, 0)}
        >
          ▶
        </button>
        <div></div>
        <button 
          className="bg-white/20 hover:bg-white/30 rounded-lg p-2 text-white" 
          onClick={() => movePlayer(0, 1)}
        >
          ▼
        </button>
        <div></div>
      </div>
    </div>
  )
}
