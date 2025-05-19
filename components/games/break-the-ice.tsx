"use client"

import { useState, useEffect, useRef } from 'react'

export function BreakTheIceGame() {
  const [grid, setGrid] = useState<string[][]>([])
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [levelComplete, setLevelComplete] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showRules, setShowRules] = useState(true)
  const [maxMoves, setMaxMoves] = useState(0)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState('')
  
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  // Initialize game grid
  useEffect(() => {
    if (gameStarted || level > 1) {
      initializeGrid()
    }
    
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current)
      }
    }
  }, [level, gameStarted])
  
  // Handle combo timer
  useEffect(() => {
    if (combo > 0) {
      const timer = setTimeout(() => {
        setCombo(0)
      }, 5000) // Reset combo after 5 seconds of inactivity
      
      return () => clearTimeout(timer)
    }
  }, [combo, moves])
  
  // Show message with auto-dismiss
  const showTemporaryMessage = (msg: string, duration: number = 2000) => {
    setMessage(msg)
    
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current)
    }
    
    messageTimerRef.current = setTimeout(() => {
      setMessage('')
    }, duration)
  }
  
  const startGame = () => {
    setGameStarted(true)
    setLevel(1)
    setScore(0)
    setMoves(0)
    setGameOver(false)
    setLevelComplete(false)
    setShowRules(false)
    setCombo(0)
    initializeGrid()
  }
  
  const initializeGrid = () => {
    const size = 6 + Math.min(2, level - 1) // Grid grows with level
    const newGrid: string[][] = []
    const newMaxMoves = 20 + level * 5
    
    for (let i = 0; i < size; i++) {
      const row: string[] = []
      for (let j = 0; j < size; j++) {
        // Different types of ice blocks with varying thicknesses
        const iceType = Math.floor(Math.random() * 3) + 1 // 1, 2, or 3 thickness
        row.push(`❄️${iceType}`)
      }
      newGrid.push(row)
    }
    
    // Add some obstacles
    const obstacleCount = Math.min(3 + level, 8)
    for (let i = 0; i < obstacleCount; i++) {
      const x = Math.floor(Math.random() * size)
      const y = Math.floor(Math.random() * size)
      
      // Don't overwrite existing obstacles
      if (newGrid[y][x] !== '🧊') {
        newGrid[y][x] = '🧊' // Unbreakable ice block
      }
    }
    
    // Add one special power-up per level (starts from level 2)
    if (level >= 2) {
      let placed = false
      let attempts = 0
      
      while (!placed && attempts < 20) {
        const x = Math.floor(Math.random() * size)
        const y = Math.floor(Math.random() * size)
        
        // Don't place on obstacles
        if (newGrid[y][x] !== '🧊') {
          newGrid[y][x] = '🔥' // Fire power-up
          placed = true
        }
        attempts++
      }
    }
    
    setGrid(newGrid)
    setMaxMoves(newMaxMoves)
    setMoves(0)
    setLevelComplete(false)
    setGameOver(false)
    
    if (level === 1) {
      showTemporaryMessage('Break all ice blocks to complete the level!', 3000)
    } else {
      showTemporaryMessage(`Level ${level} - New challenge!`, 3000)
    }
  }
  
  // Handle ice block click
  const handleIceClick = (row: number, col: number) => {
    if (gameOver || levelComplete) return
    
    const current = grid[row][col]
    
    // If it's unbreakable or already broken, do nothing
    if (current === '🧊' || current === '💧') return
    
    const newGrid = [...grid.map(r => [...r])]
    
    // If it's a power-up
    if (current === '🔥') {
      // Break adjacent ice blocks
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = row + dy
          const nx = col + dx
          
          // Check bounds
          if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
            const cell = grid[ny][nx]
            
            // Break if it's ice, but not obstacles
            if (cell.startsWith('❄️') || cell === '💧') {
              newGrid[ny][nx] = '💧'
              
              // Add points for each broken block
              if (cell.startsWith('❄️')) {
                setScore(s => s + 5 * level)
              }
            }
          }
        }
      }
      
      // The power-up itself gets used up
      newGrid[row][col] = '💧'
      
      showTemporaryMessage('🔥 Fire Power! +' + (9 * 5 * level) + ' points', 1500)
      setScore(s => s + 20 * level) // Bonus for using power-up
      setCombo(c => c + 1) // Increase combo
    } else {
      // Get ice thickness (last character of string)
      const thickness = parseInt(current.charAt(2))
      
      if (thickness > 1) {
        // Reduce thickness by 1
        newGrid[row][col] = `❄️${thickness - 1}`
      } else {
        // Break the ice completely
        newGrid[row][col] = '💧' // Water
        
        // Calculate points based on combo
        const comboMultiplier = Math.max(1, combo * 0.5)
        const pointsGained = Math.floor(10 * level * comboMultiplier)
        setScore(score + pointsGained)
        
        // Increase combo counter
        setCombo(combo + 1)
        
        // Show combo message
        if (combo >= 2) {
          showTemporaryMessage(`Combo x${combo + 1}! +${pointsGained} points`, 1500)
        }
      }
    }
    
    setGrid(newGrid)
    setMoves(moves + 1)
    
    // Check if level is complete (all breakable ice blocks are broken)
    const isLevelComplete = newGrid.every(row => 
      row.every(cell => cell === '💧' || cell === '🧊')
    )
    
    if (isLevelComplete) {
      const levelBonus = 50 * level;
      const movesLeft = maxMoves - moves;
      const efficiencyBonus = movesLeft * 5;
      const totalBonus = levelBonus + efficiencyBonus;
      
      setLevelComplete(true)
      setScore(prev => prev + totalBonus)
      
      showTemporaryMessage(`Level Complete! +${totalBonus} bonus points!`, 2500)
      
      setTimeout(() => {
        setLevel(level + 1)
      }, 2500)
    }
    
    // Check if game over (out of moves)
    if (moves >= maxMoves - 1) {
      setGameOver(true)
    }
  }
  
  const resetGame = () => {
    setLevel(1)
    setScore(0)
    setMoves(0)
    setGameOver(false)
    setLevelComplete(false)
    setCombo(0)
    initializeGrid()
  }
  
  // Apply vibration when breaking ice on mobile
  const vibrateDevice = (intensity: 'soft' | 'medium' | 'hard') => {
    if (!navigator.vibrate) return
    
    switch (intensity) {
      case 'soft':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(30)
        break
      case 'hard':
        navigator.vibrate([20, 30, 40])
        break
    }
  }
  
  // Render game rules
  const renderRules = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">Break the Ice</h2>
      <p className="mb-6 text-center">Melt your way to mastery in this cool logic game with layered challenges!</p>
      
      <button
        onClick={startGame}
        className="w-full py-3 px-6 mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
      >
        Start Game
      </button>
      
      <div className="space-y-4 text-sm">
        <h3 className="font-bold">How To Play:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click on ice blocks to break them</li>
          <li>Thicker ice takes multiple clicks to break</li>
          <li>Blue ice blocks (🧊) are unbreakable</li>
          <li>Fire blocks (🔥) break surrounding ice</li>
          <li>Complete each level by breaking all breakable ice</li>
          <li>You have limited moves per level</li>
          <li>Create combos by breaking blocks quickly</li>
        </ul>
        
        <div className="mt-4 bg-black/20 p-4 rounded-lg">
          <h4 className="font-bold mb-2">Block Types:</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/30 p-2 rounded-lg text-center">
              <div className="text-2xl">❄️</div>
              <div className="text-xs">Thin Ice<br/>(1 Click)</div>
            </div>
            <div className="bg-white/50 p-2 rounded-lg text-center">
              <div className="text-2xl">❄️</div>
              <div className="text-xs">Medium Ice<br/>(2 Clicks)</div>
            </div>
            <div className="bg-white/70 p-2 rounded-lg text-center">
              <div className="text-2xl">❄️</div>
              <div className="text-xs">Thick Ice<br/>(3 Clicks)</div>
            </div>
            <div className="bg-blue-300/90 p-2 rounded-lg text-center">
              <div className="text-2xl">🧊</div>
              <div className="text-xs">Solid Ice<br/>(Unbreakable)</div>
            </div>
            <div className="bg-blue-400/40 p-2 rounded-lg text-center">
              <div className="text-2xl">💧</div>
              <div className="text-xs">Melted Ice<br/>(Broken)</div>
            </div>
            <div className="bg-orange-400/90 p-2 rounded-lg text-center">
              <div className="text-2xl">🔥</div>
              <div className="text-xs">Fire Power<br/>(Special)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-cyan-600 to-blue-800 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
      {!gameStarted ? (
        // Show game rules and start screen before game starts
        renderRules()
      ) : (
        <>
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg min-w-[100px]">
              <div className="text-gray-300 text-xs mb-1">Score</div>
              <div className="text-white font-bold text-xl">{score}</div>
            </div>
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="text-gray-300 text-xs mb-1">Level</div>
              <div className="text-white font-bold text-xl">{level}</div>
            </div>
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg min-w-[100px]">
              <div className="text-gray-300 text-xs mb-1">Moves</div>
              <div className="text-white font-bold text-xl">{moves}/{maxMoves}</div>
            </div>
          </div>
        
          {message && (
            <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white text-center transition-all animate-fade-in">
              {message}
            </div>
          )}
          
          {combo > 1 && !message && (
            <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white text-center transition-all">
              <span className="text-yellow-300 font-bold">Combo x{combo}</span> - Keep breaking!
            </div>
          )}
          
          {gameOver && !levelComplete && (
            <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white text-center">
              Game Over! Final Score: {score}
              <button 
                onClick={resetGame} 
                className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white"
              >
                Play Again
              </button>
            </div>
          )}
          
          <div ref={gridRef} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 w-full max-w-md overflow-auto">
            <div className="grid gap-1" style={{
              display: 'grid',
              gridTemplateColumns: grid.length > 0 ? `repeat(${grid[0].length}, minmax(0, 1fr))` : 'repeat(6, minmax(0, 1fr))'
            }}>
              {grid.map((row, rowIndex) => (
                row.map((cell, colIndex) => {
                  // Extract ice type for styling
                  let content = '❄️'
                  let bgColor = 'bg-white/60'
                  let animation = ''
                  
                  if (cell.startsWith('❄️')) {
                    const thickness = parseInt(cell.charAt(2))
                    bgColor = thickness === 1 ? 'bg-white/30' : 
                            thickness === 2 ? 'bg-white/50' : 'bg-white/70'
                    content = '❄️'
                  } else if (cell === '🧊') {
                    content = '🧊'
                    bgColor = 'bg-blue-300/90'
                  } else if (cell === '💧') {
                    content = '💧'
                    bgColor = 'bg-blue-400/40'
                  } else if (cell === '🔥') {
                    content = '🔥'
                    bgColor = 'bg-orange-500/60'
                    animation = 'animate-pulse'
                  }
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => {
                        handleIceClick(rowIndex, colIndex)
                        vibrateDevice(cell === '🔥' ? 'hard' : cell.startsWith('❄️') ? (
                          parseInt(cell.charAt(2)) === 3 ? 'medium' : 'soft'
                        ) : 'soft')
                      }}
                      className={`w-12 h-12 flex items-center justify-center text-2xl rounded-lg transition-all ${bgColor} hover:scale-95 active:scale-90 ${animation}`}
                    >
                      {content}
                    </button>
                  )
                })
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setShowRules(!showRules)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
            >
              {showRules ? "Hide" : "Show"} Instructions
            </button>
            
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
            >
              Reset Game
            </button>
          </div>
          
          {showRules && (
            <div className="mt-4 bg-black/30 rounded-lg p-4 w-full max-w-md">
              <h3 className="font-bold text-white mb-2">How to Play:</h3>
              <p className="text-white/80 text-sm">
                Break all ice blocks except the solid ones (🧊). Click on ice blocks to break them. 
                Thicker ice requires multiple clicks. Fire blocks (🔥) break all surrounding ice at once.
                Create combos by breaking blocks quickly!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
